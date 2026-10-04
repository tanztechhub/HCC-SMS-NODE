// models/invoice.js
const mongoose = require("mongoose");
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }
  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  dateOfIssue: { type: Date, required: true },
  studentName: { type: String, required: true },
  studentAdmnNumber: { type: String, required: true },
  courseEnrolled: { type: String, required: true },
  totalAmountDue: { type: Number, required: true },
  paymentDueDate: { type: Date, required: true },
  paymentStatus: { type: String, enum: ["Paid", "Pending"], default: "Pending" }
}, {
  timestamps: true,
  strict: true
});

const Invoice = hccSmsModel("Invoice", invoiceSchema, "invoices");
module.exports = Invoice;
