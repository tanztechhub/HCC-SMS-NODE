const mongoose = require("mongoose");
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }
  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const lessonSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  topic: { type: String, required: true },
  tutorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  attended: { type: Boolean, default: false },
  isMarked: { type: Boolean, default: false },
  attendedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  absentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  // Optional link back to the curriculum this lesson covers - lets the lesson
  // form populate `topic` from a pick-list (a section "topic" plus one or
  // more of its "sub-topic" items) instead of free typing. Left undefined on
  // older lessons; `topic` remains the plain-text field every UI reads.
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
  curriculumSectionId: { type: mongoose.Schema.Types.ObjectId, default: null },
  curriculumSectionTitle: { type: String, default: null },
  curriculumItemIds: [{ type: mongoose.Schema.Types.ObjectId }],
  curriculumSubtopics: [{ type: String }],
  // A lesson can cover several topics. Each entry is one topic (section) with
  // the sub-topics chosen from it. The four single-topic fields above mirror
  // the first entry so older clients keep rendering something sensible.
  curriculumTopics: [{
    _id: false,
    sectionId: { type: mongoose.Schema.Types.ObjectId },
    sectionTitle: { type: String },
    itemIds: [{ type: mongoose.Schema.Types.ObjectId }],
    subtopics: [{ type: String }],
  }],
});

const examSchema = new mongoose.Schema({
  examDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  examName: { type: String, required: true },
  attended: { type: Boolean, default: false },
  isMarked: { type: Boolean, default: false },
  invigilatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
  attendedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
  absentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
});

const eventSchema = new mongoose.Schema({
  eventDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  venue: { type: String, required: true },
  eventDescription: { type: String, required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
});

const timetableSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  tutorName: { type: String },
  lessons: [lessonSchema],
  exams: [examSchema],
  events: [eventSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Tutor", required: true },
}, { timestamps: true });

// Add index for better performance
timetableSchema.index({ groupId: 1, createdBy: 1 });
timetableSchema.index({ "exams._id": 1 });

const Timetable = hccSmsModel("Timetable", timetableSchema);
module.exports = Timetable;