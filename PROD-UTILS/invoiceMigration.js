// ONE-TIME MIGRATION
//
// Copies every invoice embedded inside FinancialRecords.invoices (the old,
// mixed-together finance collection) into the new standalone Invoice
// collection used by the Invoices tab / routes/invoice.js.
//
// This script only COPIES data — it does not touch or delete anything in
// FinancialRecords, and it is safe to re-run (already-migrated invoices,
// matched by invoiceNumber, are skipped).
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/invoiceMigration.js
//
// Delete this file once you've verified the Invoices tab shows the migrated
// data correctly.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

async function migrateInvoices() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const FinancialRecords = require('../models/finance');
  const Invoice = require('../models/invoice');

  const records = await FinancialRecords.find({});
  console.log(`🔍 Found ${records.length} monthly financial records to scan`);

  let totalInvoices = 0;
  let migrated = 0;
  let skippedDuplicate = 0;
  let errored = 0;

  for (const record of records) {
    for (const invoice of record.invoices || []) {
      totalInvoices++;

      try {
        const exists = await Invoice.findOne({ invoiceNumber: invoice.invoiceNumber });
        if (exists) {
          skippedDuplicate++;
          console.log(`↷ Skipped (already migrated): ${invoice.invoiceNumber}`);
          continue;
        }

        await Invoice.create({
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          dateOfIssue: invoice.dateOfIssue,
          studentName: invoice.studentName,
          studentAdmnNumber: invoice.studentAdmnNumber,
          courseEnrolled: invoice.courseEnrolled,
          totalAmountDue: invoice.totalAmountDue,
          paymentDueDate: invoice.paymentDueDate,
          paymentStatus: invoice.paymentStatus || 'Pending',
          createdAt: record.createdAt
        });

        migrated++;
        console.log(`✅ Migrated invoice ${invoice.invoiceNumber} (${invoice.studentName})`);
      } catch (error) {
        errored++;
        console.error(`❌ Failed to migrate invoice ${invoice.invoiceNumber}:`, error.message);
      }
    }
  }

  console.log('\n============================================================');
  console.log('📋 INVOICE MIGRATION SUMMARY');
  console.log('============================================================');
  console.log(`📊 Total invoices found in FinancialRecords: ${totalInvoices}`);
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`↷ Skipped (already migrated): ${skippedDuplicate}`);
  console.log(`❌ Errors: ${errored}`);
  console.log('============================================================');
  console.log('\nThe originals inside FinancialRecords.invoices were left');
  console.log('untouched — this script only copies. Once the Invoices tab');
  console.log('looks correct, you can delete this file.');

  process.exit(errored > 0 ? 1 : 0);
}

migrateInvoices().catch((error) => {
  console.error('🔥 Migration failed:', error);
  process.exit(1);
});
