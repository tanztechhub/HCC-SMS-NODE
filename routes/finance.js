const express = require('express');
const asyncHandler = require('express-async-handler');
const Staff = require('../models/staff');
const Tutor = require('../models/tutors');
const Student = require('../models/student');
const FinancialRecords = require("../models/finance");

const router = express.Router();

// Get financial records (optionally filter by year)
router.get("/", asyncHandler(async (req, res) => {
  try {
    const { year } = req.query;

    // If a year is provided, only return records for that year (month stored as "Month Year")
    const query = {}
    if (year) {
      // match month string ending with the year, e.g. "January 2026"
      query.month = new RegExp(`${year}$`)
    }

    const records = await FinancialRecords.find(query);
    res.json({ success: true, message: "Records Retrieved Successfully", data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Update student fee with tracking
router.put('/:id/fee', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { upfrontFee, amount, changeType, paymentMethod, processedBy, note } = req.body;

    // Find student by ID
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const previousAmount = Number(student.upfrontFee || 0);
    const allowedPaymentMethods = ["M-PESA", "BANK", "CHEQUE", "OTHER"];
    let updateAmount = 0;
    let newAmount = previousAmount;
    let updateType = changeType;

    if (amount !== undefined) {
      updateAmount = Number(amount);

      if (!Number.isFinite(updateAmount) || updateAmount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid fee amount" });
      }

      if (!["increase", "decrease"].includes(updateType)) {
        return res.status(400).json({ success: false, message: "Invalid fee update type" });
      }

      newAmount = updateType === "increase"
        ? previousAmount + updateAmount
        : previousAmount - updateAmount;

      if (newAmount < 0) {
        return res.status(400).json({ success: false, message: "Paid amount cannot be less than zero" });
      }
    } else {
      if (upfrontFee === undefined || !Number.isFinite(Number(upfrontFee)) || Number(upfrontFee) < 0) {
        return res.status(400).json({ success: false, message: "Invalid fee amount" });
      }

      newAmount = Number(upfrontFee);
      updateAmount = Math.abs(newAmount - previousAmount);

      if (previousAmount === 0 && newAmount > 0) {
        updateType = "initial";
      } else if (newAmount > previousAmount) {
        updateType = "increase";
      } else if (newAmount < previousAmount) {
        updateType = "decrease";
      } else {
        updateType = "initial";
      }
    }

    const normalizedPaymentMethod = allowedPaymentMethods.includes(paymentMethod) ? paymentMethod : "OTHER";

    // Record fee update
    student.feeUpdates.push({
      amount: updateAmount,
      previousAmount,
      changeType: updateType,
      paymentMethod: normalizedPaymentMethod,
      timestamp: new Date(),
      processedBy: processedBy || "system",
      note: note || `${updateType} fee update. Previous paid amount: ${previousAmount}. New paid amount: ${newAmount}.`
    });

    // Update current fee
    student.upfrontFee = newAmount;
    await student.save();

    res.json({
      success: true,
      message: "Fee updated successfully",
      data: student,
      change: {
        type: updateType,
        amount: updateAmount,
        previousAmount,
        newAmount,
        paymentMethod: normalizedPaymentMethod
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Update tutor or staff salary payment
router.put('/:type/:id/salary', asyncHandler(async (req, res) => {
  try {
    const { type, id } = req.params;
    const { month, year, amount, processedBy } = req.body;

    if (!["tutors", "staff"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'tutors' or 'staff'." });
    }

    const Model = type === "tutors" ? Tutor : Staff;

    const person = await Model.findById(id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." });
    }

    let salaryRecord = person.salaryPayments.find(payment => payment.month === month && payment.year === year);

    if (!salaryRecord) {
      // Check if any records exist for this year
      const hasRecordsForYear = person.salaryPayments.some(payment => payment.year === year);

      if (!hasRecordsForYear) {
        // Create salary records for all 12 months if none exist for this year
        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];

        monthNames.forEach(monthName => {
          person.salaryPayments.push({
            month: monthName,
            year: year,
            status: monthName === month ? "paid" : "pending",
            paidAt: monthName === month ? new Date() : null,
            amount: monthName === month ? amount : null,
            processedBy: monthName === month ? processedBy.username : null
          });
        });

        // Find the newly created record for the current month
        salaryRecord = person.salaryPayments.find(payment => payment.month === month && payment.year === year);
      } else {
        // Year records exist but specific month doesn't (shouldn't happen)
        return res.status(404).json({ success: false, message: "Salary record not found for the given month and year." });
      }
    } else {
      // Record exists, update the status and payment details
      salaryRecord.status = "paid";
      salaryRecord.amount = amount;
      salaryRecord.paidAt = new Date();
      salaryRecord.processedBy = processedBy.username;
    }

    await person.save();

    res.json({ success: true, message: "Salary payment updated successfully.", data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Get salary payment records for a tutor or staff member
router.get('/:type/:id/salary', asyncHandler(async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!["tutors", "staff"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'tutors' or 'staff'." });
    }

    const Model = type === "tutors" ? require("../models/tutors") : require("../models/staff");

    const person = await Model.findById(id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." });
    }

    res.json({ success: true, message: "Salary payment records retrieved successfully.", data: person.salaryPayments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Add bonus to tutor or staff
router.post('/:type/:id/bonus', asyncHandler(async (req, res) => {
  try {
    const { type, id } = req.params;
    const { title, amount, description, processedBy } = req.body;

    if (!["tutors", "staff"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid type. Must be 'tutors' or 'staff'." });
    }

    const Model = type === "tutors" ? Tutor : Staff;

    const person = await Model.findById(id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Person not found." });
    }

    const bonus = {
      title,
      amount,
      description,
      processedBy: processedBy?.username || processedBy,
    };

    person.bonuses.push(bonus);
    await person.save();

    res.json({ success: true, message: "Bonus added successfully.", data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Note: invoices, receipts and bills are no longer created/updated/deleted
// here — they live in their own collections/endpoints (see routes/invoice.js
// at /invoices, routes/receipt.js at /receipts and routes/bill.js at /bills).
// Financial reports (monthly/yearly/custom range) now live at /reports —
// see routes/reports.js.

module.exports = router;
