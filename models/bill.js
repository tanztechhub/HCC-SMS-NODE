// models/bill.js
const mongoose = require("mongoose");
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }
  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const billSchema = new mongoose.Schema({
  billNumber: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  vendor: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["paid", "pending"], default: "pending" }
}, {
  timestamps: true,
  strict: true
});

const Bill = hccSmsModel("Bill", billSchema, "bills");
module.exports = Bill;
