const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Receipt = require('../models/receipt');
const { sendReceiptShareEmail } = require('../utils/emailService');

// Only non-financial metadata can be corrected after the fact — amount,
// student identity and document type are permanently fixed at creation.
// transactionCode is editable since correcting a mistyped M-PESA/bank/
// cheque code doesn't change what was actually paid.
const EDITABLE_FIELDS = ['paymentMethod', 'transactionCode', 'processedBy', 'note'];

// Get all receipts (optionally filter by year and/or search term).
// Credit notes are excluded by default so the existing Receipts tab keeps
// showing exactly what it always has — pass documentType=CREDIT_NOTE or
// documentType=all to see them. $ne (not strict equality) is used so
// pre-existing receipts without a documentType field at all still match.
router.get('/', asyncHandler(async (req, res) => {
  const { year, search, documentType } = req.query;
  const query = {};

  if (documentType === 'CREDIT_NOTE') {
    query.documentType = 'CREDIT_NOTE';
  } else if (documentType !== 'all') {
    query.documentType = { $ne: 'CREDIT_NOTE' };
  }

  if (year) {
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum)) {
      query.date = {
        $gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
        $lt: new Date(`${yearNum + 1}-01-01T00:00:00.000Z`)
      };
    }
  }

  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { receiptNumber: regex }, { admnNumber: regex }];
  }

  const receipts = await Receipt.find(query).sort({ date: -1, createdAt: -1 });
  res.json({ success: true, message: 'Receipts retrieved successfully', data: receipts });
}));

// Public lookup by receipt number — used by the unauthenticated share page,
// so an admin can send a plain link (no login) that always shows live data.
router.get('/number/:receiptNumber', asyncHandler(async (req, res) => {
  const receiptNumber = decodeURIComponent(req.params.receiptNumber);
  const receipt = await Receipt.findOne({ receiptNumber });
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }
  res.json({ success: true, data: receipt });
}));

// Get a single receipt
router.get('/:id', asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }
  res.json({ success: true, data: receipt });
}));

// Manual creation is permanently disabled — every real receipt and credit
// note is generated automatically by the server itself (student
// registration, application admission, or a fee update/decrement), each of
// which calls Receipt.create() directly and bypasses this router entirely.
// A route that lets anyone hand-craft a "proof of payment" defeats the
// whole point of the immutability guarantees below, so it's closed rather
// than just hidden behind a disabled frontend button.
router.post('/', asyncHandler(async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Receipts and credit notes can only be generated automatically by the system (registration, admission, or a fee update) — manual creation is disabled.'
  });
}));

// Update a receipt — restricted to non-financial metadata. The amount,
// student identity and document type can't be changed once issued; a
// correction to the actual paid amount must go through a fee decrement
// (which generates its own Credit Note) instead of editing history.
router.put('/:id', asyncHandler(async (req, res) => {
  const updateFields = {};
  EDITABLE_FIELDS.forEach(field => {
    if (req.body[field] !== undefined) updateFields[field] = req.body[field];
  });

  const receipt = await Receipt.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  res.json({ success: true, message: 'Receipt updated successfully', data: receipt });
}));

// Email a receipt's share link to a recipient. shareUrl is built by the
// frontend (it knows its own origin), so no frontend-URL env var is needed here.
router.post('/:id/share/email', asyncHandler(async (req, res) => {
  const { to, shareUrl } = req.body;

  if (!to || !shareUrl) {
    return res.status(400).json({ success: false, message: 'Recipient email and shareUrl are required' });
  }

  const receipt = await Receipt.findById(req.params.id);
  if (!receipt) {
    return res.status(404).json({ success: false, message: 'Receipt not found' });
  }

  const result = await sendReceiptShareEmail(receipt, to, shareUrl);
  if (!result.success) {
    return res.status(500).json({ success: false, message: result.error || 'Failed to send email' });
  }

  res.json({ success: true, message: 'Receipt emailed successfully' });
}));

// Deletion is permanently disabled for the same reason editing is
// restricted — receipts and credit notes are the permanent ledger that
// reports.js reconciles against. Deleting either one would let history
// quietly disappear (e.g. a credit note vanishing would resurrect the exact
// decrement gap this whole ledger was built to close). This applies to
// both document types, not just credit notes, for the same reason PUT does.
router.delete('/:id', asyncHandler(async (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Receipts and credit notes are permanent records and cannot be deleted.'
  });
}));

module.exports = router;
