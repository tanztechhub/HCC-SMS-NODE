// models/receipt.js
const mongoose = require("mongoose");
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }
  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  documentType: { type: String, enum: ["RECEIPT", "CREDIT_NOTE"], default: "RECEIPT" },
  // Links a CREDIT_NOTE back to the student.feeUpdates entry that caused
  // it, so a decrement can never generate more than one credit note and
  // the backfill script can safely re-run without duplicating records.
  sourceFeeUpdateId: { type: mongoose.Schema.Types.ObjectId },
  date: { type: Date, required: true },
  name: { type: String, required: true },
  admnNumber: { type: String, required: true },
  courseEnrolled: { type: String },
  nationalIdNumber: { type: String, required: true },
  totalAmountDue: { type: Number, required: true },
  totalAmountRemaining: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ["M-PESA", "BANK", "CHEQUE", "CASH", "OTHER"], default: "OTHER" },
  // The unique code M-PESA/bank/cheque transactions generate — not
  // applicable to CASH/OTHER, so it's optional at the schema level.
  transactionCode: { type: String },
  processedBy: { type: String },
  note: { type: String }
}, {
  timestamps: true,
  strict: true
});

const Receipt = hccSmsModel("Receipt", receiptSchema, "receipts");
module.exports = Receipt;
