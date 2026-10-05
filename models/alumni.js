const mongoose = require('mongoose');
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }

  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const AlumniSchema = new mongoose.Schema({
  recordOrigin: { type: String, enum: ["admission", "masterlist"], default: "admission" },
  importSource: { type: mongoose.Schema.Types.Mixed },
  academicYear: { type: String, required: true},
  courseName: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  admissionDate: { type: Date, required: function () { return this.recordOrigin !== "masterlist"; } },
  upfrontFee: { type: Number, required: function () { return this.recordOrigin !== "masterlist"; } },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: function () { return this.recordOrigin !== "masterlist"; } },
  religion: String,
  nationality: String,
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  nationalId: String,
  courseFee: Number,
  exams: [{
    name: String,
    weight: Number,
    score: Number
  }],
  graduationDate: { type: Date, default: Date.now },
  isCertificateReady: Boolean,
  tutorName: String,
}, { timestamps: true });

module.exports = hccSmsModel('Alumni', AlumniSchema);
