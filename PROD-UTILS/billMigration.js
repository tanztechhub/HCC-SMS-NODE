// ONE-TIME MIGRATION
//
// Copies every bill embedded inside FinancialRecords.bills (the old,
// mixed-together finance collection) into the new standalone Bill
// collection used by the Bills tab / routes/bill.js.
//
// This script only COPIES data — it does not touch or delete anything in
// FinancialRecords, and it is safe to re-run (already-migrated bills,
// matched by billNumber, are skipped).
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/billMigration.js
//
// Delete this file once you've verified the Bills tab shows the migrated
// data correctly.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

async function migrateBills() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const FinancialRecords = require('../models/finance');
  const Bill = require('../models/bill');

  const records = await FinancialRecords.find({});
  console.log(`🔍 Found ${records.length} monthly financial records to scan`);

  let totalBills = 0;
  let migrated = 0;
  let skippedDuplicate = 0;
  let errored = 0;

  for (const record of records) {
    for (const bill of record.bills || []) {
      totalBills++;

      try {
        const exists = await Bill.findOne({ billNumber: bill.billNumber });
        if (exists) {
          skippedDuplicate++;
          console.log(`↷ Skipped (already migrated): ${bill.billNumber}`);
          continue;
        }

        await Bill.create({
          _id: bill._id,
          billNumber: bill.billNumber,
          date: bill.date,
          vendor: bill.vendor,
          description: bill.description,
          amount: bill.amount,
          dueDate: bill.dueDate,
          status: bill.status || 'pending',
          createdAt: record.createdAt
        });

        migrated++;
        console.log(`✅ Migrated bill ${bill.billNumber} (${bill.vendor})`);
      } catch (error) {
        errored++;
        console.error(`❌ Failed to migrate bill ${bill.billNumber}:`, error.message);
      }
    }
  }

  console.log('\n============================================================');
  console.log('📋 BILL MIGRATION SUMMARY');
  console.log('============================================================');
  console.log(`📊 Total bills found in FinancialRecords: ${totalBills}`);
  console.log(`✅ Migrated: ${migrated}`);
  console.log(`↷ Skipped (already migrated): ${skippedDuplicate}`);
  console.log(`❌ Errors: ${errored}`);
  console.log('============================================================');
  console.log('\nThe originals inside FinancialRecords.bills were left');
  console.log('untouched — this script only copies. Once the Bills tab');
  console.log('looks correct, you can delete this file.');

  process.exit(errored > 0 ? 1 : 0);
}

migrateBills().catch((error) => {
  console.error('🔥 Migration failed:', error);
  process.exit(1);
});
