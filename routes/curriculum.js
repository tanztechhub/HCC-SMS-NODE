// routes/curriculum.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const router = express.Router();
const Curriculum = require('../models/curriculum');
const Course = require('../models/courses');

// 📌 Get every course mapped to its curriculum (creates no records - courses
// with no curriculum yet just come back with an empty sections array)
router.get('/', asyncHandler(async (req, res) => {
  const [courses, curricula] = await Promise.all([
    Course.find().sort({ name: 1 }),
    Curriculum.find(),
  ]);

  const curriculumByCourseId = new Map(
    curricula.map((curriculum) => [curriculum.courseId.toString(), curriculum])
  );

  const data = courses.map((course) => {
    const curriculum = curriculumByCourseId.get(course._id.toString());
    return {
      courseId: course._id,
      courseName: course.name,
      curriculumId: curriculum?._id || null,
      sections: curriculum?.sections || [],
    };
  });

  res.json({ success: true, data });
}));

// 📌 Get the curriculum for a single course (used by the lesson form)
router.get('/course/:courseId', asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found' });
  }

  const curriculum = await Curriculum.findOne({ courseId });

  res.json({
    success: true,
    data: {
      courseId: course._id,
      courseName: course.name,
      curriculumId: curriculum?._id || null,
      sections: curriculum?.sections || [],
    },
  });
}));

const getOrCreateCurriculum = async (courseId) => {
  let curriculum = await Curriculum.findOne({ courseId });
  if (!curriculum) {
    const course = await Course.findById(courseId);
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }
    curriculum = await Curriculum.create({ courseId, sections: [] });
  }
  return curriculum;
};

// 📌 Add a section to a course's curriculum (creates the curriculum doc on first use)
router.post('/course/:courseId/section', asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Section title is required' });
  }

  try {
    const curriculum = await getOrCreateCurriculum(courseId);
    curriculum.sections.push({ title: title.trim(), items: [] });
    await curriculum.save();

    res.status(201).json({ success: true, message: 'Section added successfully', data: curriculum });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}));

// 📌 Rename a section
router.put('/section/:sectionId', asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Section title is required' });
  }

  const curriculum = await Curriculum.findOne({ 'sections._id': sectionId });
  if (!curriculum) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  const section = curriculum.sections.id(sectionId);
  section.title = title.trim();
  await curriculum.save();

  res.json({ success: true, message: 'Section updated successfully', data: curriculum });
}));

// 📌 Delete a section (and every item inside it)
router.delete('/section/:sectionId', asyncHandler(async (req, res) => {
  const { sectionId } = req.params;

  const curriculum = await Curriculum.findOne({ 'sections._id': sectionId });
  if (!curriculum) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  curriculum.sections.pull({ _id: sectionId });
  await curriculum.save();

  res.json({ success: true, message: 'Section deleted successfully', data: curriculum });
}));

// 📌 Add an item to a section
router.post('/section/:sectionId/item', asyncHandler(async (req, res) => {
  const { sectionId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Item title is required' });
  }

  const curriculum = await Curriculum.findOne({ 'sections._id': sectionId });
  if (!curriculum) {
    return res.status(404).json({ success: false, message: 'Section not found' });
  }

  const section = curriculum.sections.id(sectionId);
  section.items.push({ title: title.trim() });
  await curriculum.save();

  res.status(201).json({ success: true, message: 'Item added successfully', data: curriculum });
}));

// 📌 Rename an item
router.put('/item/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Item title is required' });
  }

  const curriculum = await Curriculum.findOne({ 'sections.items._id': itemId });
  if (!curriculum) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const section = curriculum.sections.find((s) => s.items.id(itemId));
  const item = section.items.id(itemId);
  item.title = title.trim();
  await curriculum.save();

  res.json({ success: true, message: 'Item updated successfully', data: curriculum });
}));

// 📌 Delete an item
router.delete('/item/:itemId', asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const curriculum = await Curriculum.findOne({ 'sections.items._id': itemId });
  if (!curriculum) {
    return res.status(404).json({ success: false, message: 'Item not found' });
  }

  const section = curriculum.sections.find((s) => s.items.id(itemId));
  section.items.pull({ _id: itemId });
  await curriculum.save();

  res.json({ success: true, message: 'Item deleted successfully', data: curriculum });
}));

module.exports = router;
