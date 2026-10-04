const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Bill = require('../models/bill');

const ALLOWED_FIELDS = ['billNumber', 'date', 'vendor', 'description', 'amount', 'dueDate', 'status'];

// Get all bills (optionally filter by year, status, search)
router.get('/', asyncHandler(async (req, res) => {
  const { year, status, search } = req.query;
  const query = {};

  if (year) {
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum)) {
      query.date = {
        $gte: new Date(`${yearNum}-01-01T00:00:00.000Z`),
        $lt: new Date(`${yearNum + 1}-01-01T00:00:00.000Z`)
      };
    }
  }

  if (status && status !== 'all') {
    query.status = status.toLowerCase();
  }

  if (search) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ vendor: regex }, { billNumber: regex }, { description: regex }];
  }

  const bills = await Bill.find(query).sort({ date: -1, createdAt: -1 });
  res.json({ success: true, message: 'Bills retrieved successfully', data: bills });
}));

// Get a single bill
router.get('/:id', asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    return res.status(404).json({ success: false, message: 'Bill not found' });
  }
  res.json({ success: true, data: bill });
}));

// Create a bill
router.post('/', asyncHandler(async (req, res) => {
  const { billNumber, date, vendor, description, amount, dueDate } = req.body;

  if (!billNumber || !date || !vendor || !description || amount === undefined || !dueDate) {
    return res.status(400).json({
      success: false,
      message: 'billNumber, date, vendor, description, amount and dueDate are required'
    });
  }

  try {
    const payload = {};
    ALLOWED_FIELDS.forEach(field => {
      if (req.body[field] !== undefined) payload[field] = req.body[field];
    });

    const bill = await Bill.create(payload);
    res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Bill number ${billNumber} already exists` });
    }
    throw error;
  }
}));

// Update a bill (also used for status toggling)
router.put('/:id', asyncHandler(async (req, res) => {
  const updateFields = {};
  ALLOWED_FIELDS.forEach(field => {
    if (req.body[field] !== undefined) updateFields[field] = req.body[field];
  });

  try {
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    res.json({ success: true, message: 'Bill updated successfully', data: bill });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: `Bill number ${req.body.billNumber} already exists` });
    }
    throw error;
  }
}));

// Delete a bill
router.delete('/:id', asyncHandler(async (req, res) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);
  if (!bill) {
    return res.status(404).json({ success: false, message: 'Bill not found' });
  }
  res.json({ success: true, message: 'Bill deleted successfully' });
}));

module.exports = router;
