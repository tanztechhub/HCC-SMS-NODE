// models/curriculum.js
const mongoose = require('mongoose');
const { getHccSmsDB } = require('../config/db');

const hccSmsConnection = getHccSmsDB();
const hccSmsModel = (name, schema, collection) => {
  if (!schema) {
    return hccSmsConnection.model(name);
  }

  return hccSmsConnection.models[name] || hccSmsConnection.model(name, schema, collection);
};

const curriculumItemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
}, { timestamps: true });

const curriculumSectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  items: [curriculumItemSchema],
}, { timestamps: true });

// One curriculum document per course - it is global (not tied to a tutor),
// so any tutor editing it changes what every other tutor sees.
const curriculumSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
  sections: [curriculumSectionSchema],
}, { timestamps: true });

const Curriculum = hccSmsModel('Curriculum', curriculumSchema);
module.exports = Curriculum;
