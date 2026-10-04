# Production Utilities

This folder contains utility scripts for database migrations and fixes.

## Available Scripts

### 1. fixStudentExamScheme.js
Fixes students with empty `exams` arrays by populating them with their course's exam scheme.

**When to use:**
- After updating the admission process
- If students were enrolled before exam scheme assignment was implemented
- When students have empty exam arrays and need them populated

**What it does:**
1. Finds all students with empty or missing `exams` array
2. Fetches their enrolled course document
3. Copies the course's `examScheme` to the student's `exams` array
4. Each exam is initialized with `score: 0`

**How to run:**

```bash
# Navigate to NODE directory
cd server

# Run the script
node PROD-UTILS/fixStudentExamScheme.js
```

**Expected output:**
```
✅ Connected to MongoDB
🔍 Searching for students with empty exams array...

📊 Found 15 students with empty exams array

✅ Updated: John Doe (ADM-2024-001) - Course: Computer Science
   Assigned 4 exams: CAT 1, CAT 2, Final Exam, Project

...

============================================================
📋 MIGRATION SUMMARY
============================================================
✅ Successfully updated: 15 students
⚠️  Skipped: 0 students
❌ Errors: 0 students
📊 Total processed: 15 students
============================================================

🎉 Migration completed successfully!
```

**Important Notes:**
- ✅ Safe to run multiple times - skips students who already have exams
- ✅ Non-destructive - only updates students with empty exams array
- ⚠️  Requires valid course reference - skips students with invalid courses
- ⚠️  Configure the MongoDB connection in server/.env

### 2. migrateStudentPasswords.js
Migrates passwords for students who were enrolled without passwords.

**How to run:**
```bash
node PROD-UTILS/migrateStudentPasswords.js
```

### 3. receiptMigration.js
One-time copy of every receipt embedded inside `FinancialRecords.receipts`
into the new standalone `Receipt` collection (see `models/receipt.js` and
`routes/receipt.js`, mounted at `/receipts`). The new Receipts tab in the
frontend reads/writes only the new collection.

**What it does:**
1. Scans every `FinancialRecords` document for its embedded `receipts` array
2. Copies each receipt into the `Receipt` collection, preserving its
   original `_id` and `receiptNumber`
3. Skips any receipt whose `receiptNumber` already exists in the new
   collection, so it's safe to re-run

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/receiptMigration.js
```

**Important notes:**
- ✅ Non-destructive — only copies; the old embedded receipts are left in
  place inside `FinancialRecords`
- ✅ Safe to run multiple times — already-migrated receipts are skipped
- ⚠️ One-time use — delete this file once you've confirmed the Receipts
  tab shows the migrated data correctly

### 4. backfillMissingAdmissionReceipts.js
Creates a receipt for any student who was admitted with an initial upfront
fee but has no matching "Initial admission fee" receipt — e.g. students
admitted via the Admission tab or Applications tab before automatic receipt
generation was added to `POST /students/register` and
`POST /applications/:id/admit`.

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/backfillMissingAdmissionReceipts.js
```

**Important notes:**
- ✅ Safe to run multiple times — students who already have a matching
  receipt are skipped
- ⚠️ One-time use — delete this file once the Receipts tab shows a receipt
  for every admitted student who paid an initial fee

### 5. billMigration.js
One-time copy of every bill embedded inside `FinancialRecords.bills` into
the new standalone `Bill` collection (see `models/bill.js` and
`routes/bill.js`, mounted at `/bills`). The new Bills tab in the frontend
reads/writes only the new collection.

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/billMigration.js
```

**Important notes:**
- ✅ Non-destructive — only copies; the old embedded bills are left in
  place inside `FinancialRecords`
- ✅ Safe to run multiple times — already-migrated bills are skipped
- ⚠️ One-time use — delete this file once you've confirmed the Bills tab
  shows the migrated data correctly

### 6. invoiceMigration.js
One-time copy of every invoice embedded inside `FinancialRecords.invoices`
into the new standalone `Invoice` collection (see `models/invoice.js` and
`routes/invoice.js`, mounted at `/invoices`). The new Invoices tab in the
frontend reads/writes only the new collection.

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/invoiceMigration.js
```

**Important notes:**
- ✅ Non-destructive — only copies; the old embedded invoices are left in
  place inside `FinancialRecords`
- ✅ Safe to run multiple times — already-migrated invoices are skipped
- ⚠️ One-time use — delete this file once you've confirmed the Invoices tab
  shows the migrated data correctly

### 7. backfillCreditNotesForDecrements.js
Every fee decrement recorded before the Credit Note patch only updated
`student.feeUpdates` — no matching document existed in the `Receipt`
collection, so the original receipt for the payment being corrected stayed
overstated forever. This is what caused "Collected This Period" in the
Reports tab to come out higher than the live student totals.

This script walks every student's `feeUpdates`, finds every `decrease`
entry, and creates the `CREDIT_NOTE` (in the same `Receipt` collection,
`documentType: 'CREDIT_NOTE'`) that would have been created automatically
had the patch existed at the time — dated to the original decrement, not
today, so it lands in the correct historical month/year for reports.

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/backfillCreditNotesForDecrements.js
```

**Important notes:**
- ✅ Non-destructive — only creates new `CREDIT_NOTE` documents; never
  touches `feeUpdates`, `upfrontFee`, or any existing receipt
- ✅ Safe to run multiple times — each credit note is linked back to the
  `feeUpdates` entry that caused it via `sourceFeeUpdateId`, and any entry
  that already has one is skipped
- ⚠️ One-time use — delete this file once the Reports tab's "Collected This
  Period" figures reconcile correctly

### 8. seedCurriculum.js
One-time seed of the Curriculum tab's data (sections + items) for the six
known courses (Professional Barista, Sensory, Green Coffee, Coffee Roasting,
Wine, Mixology), transcribed from the client's curriculum documents.

**What it does:**
1. Fetches every `Course` document and prints its `name`
2. For each of the six curricula, matches it to a course by name
   (case-insensitive exact match, falling back to a contains-match)
3. Creates the `Curriculum` document (with all sections/items, each getting
   a real Mongo ObjectId) for any match that doesn't already have one

**How to run (from the `4-MULTI-TENANT-NODE-PULLED` folder):**
```bash
node hcc-sms/PROD-UTILS/seedCurriculum.js
```

**Important notes:**
- ✅ Safe to run multiple times — a course that already has a curriculum is
  skipped, never overwritten
- ⚠️ If a course can't be matched, the script says so and skips it — fix the
  `courseName` in the script to match your real `Course.name` and re-run
- ⚠️ One-time use — delete this file once the Curriculum tab shows the
  correct data for every course

---

## Development Notes

When creating new migration scripts:
1. Always include detailed console logging
2. Handle errors gracefully
3. Provide summary statistics
4. Make scripts idempotent (safe to run multiple times)
5. Close database connections properly
