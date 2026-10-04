const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();

const Student = require('../models/student');
const Alumni = require('../models/alumni');
const Staff = require('../models/staff');
const Tutor = require('../models/tutors');
const Receipt = require('../models/receipt');
const Bill = require('../models/bill');
const Invoice = require('../models/invoice');

// Sum up salary payments across a list of people (tutors or staff) that
// were actually marked paid within [fromDate, toDate], using paidAt (the
// moment money actually left) rather than the month/year label.
const collectSalaries = (people, roleLabel, fromDate, toDate) => {
  let total = 0;
  const details = [];
  people.forEach(person => {
    (person.salaryPayments || []).forEach(payment => {
      if (payment.status === 'paid' && payment.paidAt && payment.paidAt >= fromDate && payment.paidAt <= toDate) {
        const amt = Number(payment.amount || 0);
        total += amt;
        details.push({
          name: `${person.firstName} ${person.lastName}`,
          role: person.role,
          type: roleLabel,
          month: payment.month,
          year: payment.year,
          amount: amt,
          paidAt: payment.paidAt,
        });
      }
    });
  });
  return { total, details };
};

const collectBonuses = (people, roleLabel, fromDate, toDate) => {
  let total = 0;
  const details = [];
  people.forEach(person => {
    (person.bonuses || []).forEach(bonus => {
      const paidDate = bonus.paidAt || bonus.dateGiven;
      if (bonus.status === 'paid' && paidDate && paidDate >= fromDate && paidDate <= toDate) {
        const amt = Number(bonus.amount || 0);
        total += amt;
        details.push({
          name: `${person.firstName} ${person.lastName}`,
          role: person.role,
          type: roleLabel,
          title: bonus.title,
          amount: amt,
          paidAt: paidDate,
        });
      }
    });
  });
  return { total, details };
};

router.get('/', asyncHandler(async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({ success: false, message: "'from' and 'to' dates are required (YYYY-MM-DD)" });
  }

  const fromDate = new Date(`${from}T00:00:00.000Z`);
  const toDate = new Date(`${to}T23:59:59.999Z`);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || fromDate > toDate) {
    return res.status(400).json({ success: false, message: "Invalid date range" });
  }

  const rangeDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

  // ---- Revenue ----
  // Active students always count (they're relevant right now, regardless of
  // which period is selected — there's no reliable way to attribute an
  // expected fee to a specific month when students pay in installments).
  // Alumni only count toward this period's totals if they actually have a
  // receipt dated within [from, to] — otherwise every period would carry
  // every student who ever graduated, forever.
  const students = await Student.find({});
  const alumni = await Alumni.find({});

  // Receipts and credit notes share a collection (documentType tells them
  // apart); collectedInPeriod is net of any decrements issued in the same
  // window, so it always reconciles with the sum of feeUpdates.
  const periodReceipts = await Receipt.find({ date: { $gte: fromDate, $lte: toDate } }).sort({ date: -1 });
  const periodReceiptsOnly = periodReceipts.filter(r => r.documentType !== 'CREDIT_NOTE');
  const periodCreditNotes = periodReceipts.filter(r => r.documentType === 'CREDIT_NOTE');
  const receiptsTotal = periodReceiptsOnly.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0);
  const creditNotesTotal = periodCreditNotes.reduce((sum, r) => sum + (r.totalAmountDue || 0), 0);
  const collectedInPeriod = receiptsTotal - creditNotesTotal;

  // Every receipt AND credit note in the period, mapped individually — shown
  // in both monthly and yearly reports (unlike the per-student mapping
  // below, this doesn't grow with the whole student roster, only with
  // actual transactions in the window, so it stays manageable even at a
  // year's scale).
  const receiptLedger = periodReceipts.map(r => ({
    id: r._id,
    documentType: r.documentType,
    receiptNumber: r.receiptNumber,
    date: r.date,
    name: r.name,
    admnNumber: r.admnNumber,
    courseEnrolled: r.courseEnrolled,
    amount: r.totalAmountDue,
    paymentMethod: r.paymentMethod,
    transactionCode: r.transactionCode,
  }));

  // A credit note still counts as a "record" for the alumni-inclusion
  // check below — it's still activity on that admission number this period.
  const admissionNumbersWithReceiptsInPeriod = new Set(
    periodReceipts.map(r => r.admnNumber).filter(Boolean)
  );
  const alumniInPeriod = alumni.filter(a => admissionNumbersWithReceiptsInPeriod.has(a.admissionNumber));

  const totalFee = students.reduce((sum, s) => sum + (s.courseFee || 0), 0)
    + alumniInPeriod.reduce((sum, a) => sum + (a.courseFee || 0), 0);
  const totalCollected = students.reduce((sum, s) => sum + (s.upfrontFee || 0), 0)
    + alumniInPeriod.reduce((sum, a) => sum + (a.upfrontFee || 0), 0);
  const totalPending = Math.max(0, totalFee - totalCollected);

  // ---- Expenses: salaries + bonuses (tutors and staff) ----
  const staffMembers = await Staff.find({});
  const tutors = await Tutor.find({});

  const staffSalaries = collectSalaries(staffMembers, 'staff', fromDate, toDate);
  const tutorSalaries = collectSalaries(tutors, 'tutor', fromDate, toDate);
  const staffBonuses = collectBonuses(staffMembers, 'staff', fromDate, toDate);
  const tutorBonuses = collectBonuses(tutors, 'tutor', fromDate, toDate);

  const salariesTotal = staffSalaries.total + tutorSalaries.total;
  const bonusesTotal = staffBonuses.total + tutorBonuses.total;
  const salaryDetails = [...staffSalaries.details, ...tutorSalaries.details]
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  const bonusDetails = [...staffBonuses.details, ...tutorBonuses.details]
    .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

  // ---- Expenses: bills ----
  // Only PAID bills count as an actual expense — a pending bill hasn't left
  // the pocket yet, so it can't be deducted, only flagged as overdue.
  const paidBills = await Bill.find({ status: 'paid', date: { $gte: fromDate, $lte: toDate } }).sort({ date: -1 });
  const billsTotal = paidBills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const today = new Date();
  const overdueBills = await Bill.find({ status: 'pending', dueDate: { $lt: today } }).sort({ dueDate: 1 });
  const overdueBillsTotal = overdueBills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const totalExpenses = salariesTotal + bonusesTotal + billsTotal;

  // ---- Invoices (informational only — not revenue or expense) ----
  const periodInvoices = await Invoice.find({ dateOfIssue: { $gte: fromDate, $lte: toDate } });
  const invoicesTotal = periodInvoices.reduce((sum, i) => sum + (i.totalAmountDue || 0), 0);

  const net = collectedInPeriod - totalExpenses;

  const data = {
    period: { from, to, days: rangeDays },
    revenue: {
      totalFee,
      totalCollected,
      totalPending,
      collectedInPeriod,
      receiptsTotal,
      creditNotesTotal,
      receiptCount: periodReceiptsOnly.length,
      creditNoteCount: periodCreditNotes.length,
      alumniIncluded: alumniInPeriod.length,
    },
    expenses: {
      salaries: { total: salariesTotal, staffTotal: staffSalaries.total, tutorTotal: tutorSalaries.total, details: salaryDetails },
      bonuses: { total: bonusesTotal, staffTotal: staffBonuses.total, tutorTotal: tutorBonuses.total, details: bonusDetails },
      bills: { total: billsTotal, count: paidBills.length, bills: paidBills },
      overdueBills: { total: overdueBillsTotal, count: overdueBills.length, bills: overdueBills },
      totalExpenses,
    },
    invoices: { total: invoicesTotal, count: periodInvoices.length },
    net,
    receiptLedger,
  };

  // ---- Students & Alumni: full fee-status mapping with payment history ----
  // The client wants every student AND every alumnus individually mapped,
  // even on a yearly report — explicitly accepted as a slower query in
  // exchange for completeness, so this is never gated behind a range check.
  const groupByBalance = (entries) => {
    const complete = [];
    const pending = [];
    const conflict = [];
    entries.forEach(entry => {
      if (entry.balance === 0) complete.push(entry);
      else if (entry.balance > 0) pending.push(entry);
      else conflict.push(entry);
    });
    return {
      complete,
      pending,
      conflict,
      counts: { complete: complete.length, pending: pending.length, conflict: conflict.length, total: entries.length },
    };
  };

  const studentEntries = students.map(s => {
    const balance = (s.courseFee || 0) - (s.upfrontFee || 0);
    return {
      id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      admissionNumber: s.admissionNumber,
      course: s.courseName,
      courseFee: s.courseFee || 0,
      upfrontFee: s.upfrontFee || 0,
      balance,
      feeUpdates: [...(s.feeUpdates || [])].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)),
    };
  });
  data.students = groupByBalance(studentEntries);

  // Alumni lose their feeUpdates array on graduation, so their payment
  // history is reconstructed from the permanent Receipt collection instead,
  // matched by admission number. This isn't scoped to [from, to] — a
  // payment history means everything they ever paid, not just this period.
  const alumniAdmissionNumbers = alumni.map(a => a.admissionNumber);
  const alumniReceipts = await Receipt.find({ admnNumber: { $in: alumniAdmissionNumbers } }).sort({ date: -1 });
  const alumniReceiptsByAdmn = new Map();
  alumniReceipts.forEach(r => {
    const list = alumniReceiptsByAdmn.get(r.admnNumber) || [];
    list.push({
      id: r._id,
      documentType: r.documentType,
      receiptNumber: r.receiptNumber,
      date: r.date,
      amount: r.totalAmountDue,
      paymentMethod: r.paymentMethod,
      transactionCode: r.transactionCode,
    });
    alumniReceiptsByAdmn.set(r.admnNumber, list);
  });

  const alumniEntries = alumni.map(a => {
    const balance = (a.courseFee || 0) - (a.upfrontFee || 0);
    return {
      id: a._id,
      name: `${a.firstName} ${a.lastName}`,
      admissionNumber: a.admissionNumber,
      course: a.courseName,
      courseFee: a.courseFee || 0,
      upfrontFee: a.upfrontFee || 0,
      balance,
      graduationDate: a.graduationDate,
      paymentHistory: alumniReceiptsByAdmn.get(a.admissionNumber) || [],
    };
  });
  data.alumni = groupByBalance(alumniEntries);

  // Enrollment overview — a period-scoped supplementary stat alongside the
  // full listings above. A student who joined during the period may have
  // already graduated (moved from Students to Alumni) by the time this
  // report is generated, so both collections are checked against
  // startDate (falling back to admissionDate for students without one,
  // and always for alumni since they don't carry a startDate at all).
  const inRange = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    return d >= fromDate && d <= toDate;
  };

  const newActive = students.filter(s => inRange(s.startDate || s.admissionDate)).length;
  const newGraduated = alumni.filter(a => inRange(a.admissionDate)).length;

  data.enrollment = {
    newInPeriod: { total: newActive + newGraduated, stillActive: newActive, graduated: newGraduated },
    currentActiveStudents: students.length,
    totalAlumni: alumni.length,
  };

  res.json({ success: true, message: 'Report generated successfully', data });
}));

module.exports = router;
