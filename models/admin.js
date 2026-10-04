// models/admin.js
const mongoose = require('mongoose');
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }

  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, },
  profileImage: { type: String, default: null },
  profilePicPublicId: { type: String, default: null },
  isBlockedAccess: { type: Boolean, default: false },
  token: { type: String, default: null }
}, {
  timestamps: true
});

// Clear any existing indexes (if any)
// hccSmsModel('Admin', adminSchema).collection.dropIndexes();

const Admin = hccSmsModel('Admin', adminSchema);
module.exports = Admin;
