// models/adminPermissions.js
const mongoose = require('mongoose');
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }

  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

// Singleton document: one settings record controls what Junior Admins can access.
// Senior Admins always have unrestricted access and are never gated by this.
const adminPermissionsSchema = new mongoose.Schema({
  juniorAllowedTabs: { type: [String], default: [] },
}, {
  timestamps: true
});

const AdminPermissions = hccSmsModel('AdminPermissions', adminPermissionsSchema);
module.exports = AdminPermissions;
