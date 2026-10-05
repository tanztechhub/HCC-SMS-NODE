const mongoose = require('mongoose');
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }

  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, },
  topic: { type: String, },
  event: { type: String, },
  tutorId: { type: mongoose.Schema.Types.ObjectId, },
});

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true },
  score: { type: Number, default: 0 }
});

const borrowedBooks = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
  bookName: { type: String, },
  bookImage: { type: String, },
  dateBorrowed: { type: Date, },
  returnDate: { type: Date, },
  allowedDays: { type: Number },
  accruedFee: { type: Number, default: 0 },
});

const feeUpdateSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  previousAmount: { type: Number, required: true },
  changeType: { type: String, enum: ["initial", "increase", "decrease"], required: true },
  paymentMethod: { type: String, enum: ["M-PESA", "BANK", "CHEQUE", "OTHER"], default: "OTHER" },
  // The unique code M-PESA/bank/cheque transactions generate — not
  // applicable to CASH/OTHER, so it's optional at the schema level.
  transactionCode: { type: String },
  timestamp: { type: Date, default: Date.now },
  processedBy: { type: String },
  note: { type: String }
});


const studentSchema = new mongoose.Schema({
  recordOrigin: { type: String, enum: ["admission", "masterlist"], default: "admission" },
  importSource: { type: mongoose.Schema.Types.Mixed },
  academicYear: { type: String, required: false },
  course: { type: String, required: true },
  courseName: { type: String, required: true },
  admissionNumber: { type: String, required: true, unique: true },
  admissionDate: { type: Date, required: false },
  upfrontFee: { type: Number, default: 0 },
  feeUpdates: [feeUpdateSchema],
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  allotment: { type: String, required: false },
  isCertificateReady: { type: Boolean, },
  tutorId: { type: String, required: false },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false
  },
  tutorName: { type: String, required: false },
  gender: { type: String, required: true },
  dateOfBirth: { type: Date, required: function () { return this.recordOrigin !== "masterlist"; } },
  startDate: { type: Date, required: true },
  assignedCohort: { type: Date, required: false },
  religion: { type: String, required: false },
  nationality: { type: String, required: false },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  nationalId: { type: String, required: true },
  emergencyContact: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    relation: { type: String, required: true },
    phone: { type: String, required: true }
  },
  courseDuration: { type: String, required: false },
  courseFee: { type: Number, required: false },
  profileImage: { type: String, required: false },
  profilePicPublicId: { type: String, required: false },
  password: { type: String },
  attendance: {
    attended: [attendanceSchema],
    absent: [attendanceSchema],
  },
  exams: [examSchema],
  assignedExams: [{
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    examName: { type: String },
    examSchemeName: { type: String },
    examSchemeWeight: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['upcoming','active','closed'], default: 'upcoming' },
    submitted: { type: Boolean, default: false },
    submittedAt: { type: Date }
  }],
  examResponses: [{
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    answers: [{
      questionId: { type: String },
      response: { type: mongoose.Schema.Types.Mixed },
      marksAwarded: { type: Number, default: 0 }
    }],
    totalScore: { type: Number, default: 0 },
    appliedScore: { type: Number, default: 0 },
    isAutoMarked: { type: Boolean, default: false },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
    markedAt: { type: Date },
    finalized: { type: Boolean, default: false }
  }],
  borrowedBooks: [borrowedBooks],
}, { timestamps: true });

// Preserve ordinary admission uniqueness while allowing historical enrolments to share identity fields.
studentSchema.index({ email: 1 }, { unique: true, name: "email_admission_unique", partialFilterExpression: { recordOrigin: "admission" } });
studentSchema.index({ nationalId: 1 }, { unique: true, partialFilterExpression: { recordOrigin: "admission" } });

const Student = hccSmsConnection.models.Student || hccSmsModel('Student', studentSchema);

module.exports = Student;
