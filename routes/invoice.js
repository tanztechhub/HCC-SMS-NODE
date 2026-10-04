const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Invoice = require('../models/invoice');

const ALLOWED_FIELDS = [
  'invoiceNumber', 'dateOfIssue', 'studentName', 'studentAdmnNumber',
  'courseEnrolled', 'totalAmountDue', 'paymentDueDate', 'paymentStatus'
];

// Get all invoices (optionally filter by year, status, search)
router.get('/', asyncHandler(async (req, res) => {
  const { year, status, search } = req.query;
  const query = {};

  if (year) {
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum)) {
      query.dateOfIssue = {
        $gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
        $lt: new Date(`${yearNum + 1}-01-01T00:00:00.000Z`)
      };
    }
  }

  if (status && status !== 'all') {
    query.paymentStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ studentName: regex }, { invoiceNumber: regex }, { studentAdmnNumber: regex }];
  }

  const invoices = await Invoice.find(query).sort({ dateOfIssue: -1, createdAt: -1 });
  res.json({ success: true, message: 'Invoices retrieved successfully', data: invoices });
}));

// Get a single invoice
router.get('/:id', asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }
  res.json({ success: true, data: invoice });
}));

// Create an invoice
router.post('/', asyncHandler(async (req, res) => {
  const { invoiceNumber, dateOfIssue, studentName, studentAdmnNumber, courseEnrolled, totalAmountDue, paymentDueDate } = req.body;

  if (!invoiceNumber || !dateOfIssue || !studentName || !studentAdmnNumber || !courseEnrolled || totalAmountDue === undefined || !paymentDueDate) {
    return res.status(400).json({
      success: false,
      message: 'invoiceNumber, dateOfIssue, studentName, studentAdmnNumber, courseEnrolled, totalAmountDue and paymentDueDate are required'
    });
  }

  try {
    const payload = {};
    ALLOWED_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    const invoice = await Invoice.create(payload);
    res.status(201).json({ success: true, message: 'Invoice created successfully', data: invoice });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Invoice number ${invoiceNumber} already exists` });
    }
    throw error;
  }
}));

// Update an invoice (also used for status toggling)
router.put('/:id', asyncHandler(async (req, res) => {
  const updateFields = {};
  ALLOWED_FIELDS.forEach(field => {
    if (req.body[field] !== undefined) updateFields[field] = req.body[field];
  });

  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice updated successfully', data: invoice });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Invoice number ${req.body.invoiceNumber} already exists` });
    }
    throw error;
  }
}));

// Delete an invoice
router.delete('/:id', asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);
  if (!invoice) {
    return res.status(404).json({ success: false, message: 'Invoice not found' });
  }
  res.json({ success: true, message: 'Invoice deleted successfully' });
}));

module.exports = router;
