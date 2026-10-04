// routes/adminPermissions.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const AdminPermissions = require('../models/adminPermissions');
const Admin = require('../models/admin');
const protect = require('../middleware/auth');

// Keeps existing Junior Admins working exactly as before until a Senior
// Admin explicitly narrows access via the Permissions UI.
const DEFAULT_JUNIOR_TABS = [
  "courses", "studentsList", "applications", "studentAdmission", "cancelAdmission",
  "tutorsList", "classAllotment", "attendance", "examsGrades", "graduation",
  "staffList", "inventoryManagement", "studentFee", "receipts", "invoices",
  "bills", "quotations", "financialDocs", "newsletter", "forums", "alumni", "notifications",
];

const getOrCreateSettings = async () => {
  let settings = await AdminPermissions.findOne();
  if (!settings) {
    settings = await AdminPermissions.create({ juniorAllowedTabs: DEFAULT_JUNIOR_TABS });
  }
  return settings;
};

// Get current permission settings (any authenticated admin can read this)
router.get('/', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const settings = await getOrCreateSettings();
  res.json({ success: true, data: { juniorAllowedTabs: settings.juniorAllowedTabs } });
}));

// Update the tabs Junior Admins are allowed to access (Senior Admins only).
// The JWT only carries the coarse "admin" role, not the senior/junior
// distinction, so the actual admin document must be checked here.
router.put('/', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const requestingAdmin = await Admin.findById(req.user.id);
  if (!requestingAdmin || requestingAdmin.role !== 'senior') {
    return res.status(403).json({ success: false, message: 'Only senior admins can update permissions' });
  }

  const { juniorAllowedTabs } = req.body;
  if (!Array.isArray(juniorAllowedTabs) || !juniorAllowedTabs.every((tab) => typeof tab === 'string')) {
    return res.status(400).json({ success: false, message: 'juniorAllowedTabs must be an array of strings' });
  }

  const settings = await getOrCreateSettings();
  settings.juniorAllowedTabs = juniorAllowedTabs;
  await settings.save();

  res.json({
    success: true,
    message: 'Permissions updated successfully',
    data: { juniorAllowedTabs: settings.juniorAllowedTabs }
  });
}));

module.exports = router;
