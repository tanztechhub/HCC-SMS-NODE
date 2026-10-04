// ONE-TIME BACKFILL
//
// Every fee decrement recorded on a student BEFORE this patch only ever
// updated student.feeUpdates — no matching document was created in the
// Receipt collection. That means the original Receipt for the payment
// being corrected is still sitting there overstated, which is exactly the
// gap that shows up as "Collected This Period" being higher than it
// should be in the Reports tab.
//
// This script walks every student's feeUpdates array, finds every entry
// with changeType "decrease", and creates the matching CREDIT_NOTE that
// would have been created automatically had this patch existed at the
// time. The amount and "remaining balance at that moment" are both
// reconstructed directly from the feeUpdate entry itself, and the
// document's date is set to the feeUpdate's own timestamp — not today —
// so it lands in the correct historical month/year for reporting.
//
// This script only CREATES credit notes — it never touches feeUpdates,
// upfrontFee, or any existing Receipt. It is safe to re-run: each credit
// note is linked back to the feeUpdate that caused it via
// sourceFeeUpdateId, and any feeUpdate that already has a matching credit
// note is skipped.
//
// How to run (from the 4-MULTI-TENANT-NODE-PULLED folder):
//   node hcc-sms/PROD-UTILS/backfillCreditNotesForDecrements.js
//
// Delete this file once you've verified the Reports tab's "Collected This
// Period" figures look right and there are no more un-backfilled decrements.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { connectHccSmsDB } = require('../config/db');

const generateCreditNoteNumber = () =>
  `CN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

async function backfillCreditNotes() {
  await connectHccSmsDB();
  console.log('✅ Connected to HCC SMS MongoDB');

  // These models read the DB connection at require-time, so only require
  // them after the connection above has actually been established.
  const Student = require('../models/student');
  const Receipt = require('../models/receipt');

  const students = await Student.find({});
  console.log(`🔍 Found ${students.length} students to scan for historical decrements`);

  let totalDecrements = 0;
  let created = 0;
  let skippedExisting = 0;
  let errored = 0;

  for (const student of students) {
    const decrements = (student.feeUpdates || []).filter(u => u.changeType === 'decrease');

    for (const feeUpdate of decrements) {
      totalDecrements++;

      try {
        const exists = await Receipt.findOne({ sourceFeeUpdateId: feeUpdate._id });
        if (exists) {
          skippedExisting++;
          console.log(`↷ Skipped (already backfilled): ${student.admissionNumber} — feeUpdate ${feeUpdate._id}`);
          continue;
        }

        // Reconstruct the balance as it stood right after this decrement,
        // not the student's current balance.
        const balanceAfter = Math.max(0, (student.courseFee || 0) - (feeUpdate.previousAmount - feeUpdate.amount));

        await Receipt.create({
          receiptNumber: generateCreditNoteNumber(),
          documentType: 'CREDIT_NOTE',
          sourceFeeUpdateId: feeUpdate._id,
          date: feeUpdate.timestamp || student.createdAt || new Date(),
          name: `${student.firstName} ${student.lastName}`,
          admnNumber: student.admissionNumber,
          courseEnrolled: student.courseName,
          nationalIdNumber: student.nationalId,
          totalAmountDue: feeUpdate.amount,
          totalAmountRemaining: balanceAfter,
          paymentMethod: feeUpdate.paymentMethod || 'OTHER',
          processedBy: feeUpdate.processedBy || 'system',
          note: feeUpdate.note || `Backfilled credit note for a decrement of ${feeUpdate.amount}`
        });

        created++;
        console.log(`✅ Created credit note for ${student.admissionNumber} (${student.firstName} ${student.lastName}) — ${feeUpdate.amount}`);
      } catch (error) {
        errored++;
        console.error(`❌ Failed to backfill decrement for ${student.admissionNumber}:`, error.message);
      }
    }
  }

  console.log('\n============================================================');
  console.log('📋 CREDIT NOTE BACKFILL SUMMARY');
  console.log('============================================================');
  console.log(`📊 Total historical decrements found: ${totalDecrements}`);
  console.log(`✅ Credit notes created: ${created}`);
  console.log(`↷ Skipped (already backfilled): ${skippedExisting}`);
  console.log(`❌ Errors: ${errored}`);
  console.log('============================================================');
  console.log('\nNothing on Student or the original Receipt collection was');
  console.log('modified — this script only added new CREDIT_NOTE documents.');
  console.log('Once the Reports tab reconciles correctly, you can delete this file.');

  process.exit(errored > 0 ? 1 : 0);
}

backfillCreditNotes().catch((error) => {
  console.error('🔥 Backfill failed:', error);
  process.exit(1);
});
