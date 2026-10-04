// ONE-TIME BACKFILL
//
// Finds every student who was admitted with an initial upfront fee > 0 but
// has no matching "Initial admission fee" receipt in the Receipt collection
// (e.g. students admitted before automatic receipt generation was added to
// POST /students/register and POST /applications/:id/admit) and creates the
// missing receipt for them.
//
// Safe to re-run: a student is skipped if a matching initial receipt
// already exists.
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/backfillMissingAdmissionReceipts.js
//
// Delete this file once you've verified the Receipts tab shows a receipt
// for every admitted student who paid an initial fee.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

const generateReceiptNumber = () =>
  `RCPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}`;

async function backfillMissingReceipts() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const Student = require('../models/student');
  const Receipt = require('../models/receipt');

  const students = await Student.find({ upfrontFee: { $gt: 0 } });
  console.log(`🔍 Found ${students.length} students with an initial upfront fee to check`);

  let created = 0;
  let alreadyHadReceipt = 0;
  let errored = 0;

  for (const student of students) {
    try {
      const existing = await Receipt.findOne({
        admnNumber: student.admissionNumber,
        note: 'Initial admission fee'
      });

      if (existing) {
        alreadyHadReceipt++;
        continue;
      }

      await Receipt.create({
        receiptNumber: generateReceiptNumber(),
        date: student.admissionDate || student.createdAt || new Date(),
        name: `${student.firstName} ${student.lastName}`,
        admnNumber: student.admissionNumber,
        courseEnrolled: student.courseName,
        nationalIdNumber: student.nationalId,
        totalAmountDue: student.upfrontFee,
        totalAmountRemaining: Math.max(0, student.courseFee - student.upfrontFee),
        paymentMethod: 'OTHER',
        processedBy: 'system',
        note: 'Initial admission fee'
      });

      created++;
      console.log(`✅ Created missing receipt for ${student.firstName} ${student.lastName} (${student.admissionNumber})`);
    } catch (error) {
      errored++;
      console.error(`❌ Failed to backfill receipt for ${student.admissionNumber}:`, error.message);
    }
  }

  console.log('\n============================================================');
  console.log('📋 RECEIPT BACKFILL SUMMARY');
  console.log('============================================================');
  console.log(`📊 Students checked: ${students.length}`);
  console.log(`✅ Missing receipts created: ${created}`);
  console.log(`↷ Already had a receipt: ${alreadyHadReceipt}`);
  console.log(`❌ Errors: ${errored}`);
  console.log('============================================================');

  process.exit(errored > 0 ? 1 : 0);
}

backfillMissingReceipts().catch((error) => {
  console.error('🔥 Backfill failed:', error);
  process.exit(1);
});
