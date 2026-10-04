// ONE-TIME MIGRATION
//
// Copies every receipt embedded inside FinancialRecords.receipts (the old,
// mixed-together finance collection) into the new standalone Receipt
// collection used by the Receipts tab / routes/receipt.js.
//
// This script only COPIES data — it does not touch or delete anything in
// FinancialRecords, and it is safe to re-run (already-migrated receipts,
// matched by receiptNumber, are skipped).
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/receiptMigration.js
//
// Delete this file once you've verified the Receipts tab shows the
// migrated data correctly.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

async function migrateReceipts() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const FinancialRecords = require('../models/finance');
  const Receipt = require('../models/receipt');

  const records = await FinancialRecords.find({});
  console.log(`🔍 Found ${records.length} monthly financial records to scan`);

  let totalReceipts = 0;
  let migrated = 0;
  let skippedDuplicate = 0;
  let errored = 0;

  for (const record of records) {
    for (const receipt of record.receipts || []) {
      totalReceipts++;

      try {
        const exists = await Receipt.findOne({ receiptNumber: receipt.receiptNumber });
        if (exists) {
          skippedDuplicate++;
          console.log(`↷ Skipped (already migrated): ${receipt.receiptNumber}`);
          continue;
        }

        await Receipt.create({
          _id: receipt._id,
          receiptNumber: receipt.receiptNumber,
          date: receipt.date,
          name: receipt.name,
          admnNumber: receipt.admnNumber,
          courseEnrolled: receipt.courseEnrolled,
          nationalIdNumber: receipt.nationalIdNumber,
          totalAmountDue: receipt.totalAmountDue,
          totalAmountRemaining: receipt.totalAmountRemaining,
          createdAt: record.createdAt
        });

        migrated++;
        console.log(`✅ Migrated receipt ${receipt.receiptNumber} (${receipt.name})`);
      } catch (error) {
        errored++;
        console.error(`❌ Failed to migrate receipt ${receipt.receiptNumber}:`, error.message);
      }
    }
  }

  console.log('\n============================================================');
  console.log('📋 RECEIPT MIGRATION SUMMARY');
  console.log('============================================================');
  console.log(`📊 Total receipts found in FinancialRecords: ${totalReceipts}`);
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`↷ Skipped (already migrated): ${skippedDuplicate}`);
  console.log(`❌ Errors: ${errored}`);
  console.log('============================================================');
  console.log('\nThe originals inside FinancialRecords.receipts were left');
  console.log('untouched — this script only copies. Once the Receipts tab');
  console.log('looks correct, you can delete this file.');

  process.exit(errored > 0 ? 1 : 0);
}

migrateReceipts().catch((error) => {
  console.error('🔥 Migration failed:', error);
  process.exit(1);
});
