const express = require('express');

const router = express.Router();
let mountedRouteCount = 0;
const routeMountErrors = [];

const mountRoute = (routePath, modulePath) => {
  try {
    router.use(routePath, require(modulePath));
    mountedRouteCount += 1;
  } catch (error) {
    const mountError = {
      routePath,
      modulePath,
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message
    };
    routeMountErrors.push(mountError);
    console.error(`[hcc-sms] Failed to load ${modulePath} on ${routePath}: [${mountError.code}] ${mountError.message}`);
    throw error;
  }
};

mountRoute('/students', './routes/student');
mountRoute('/courses', './routes/courses');
mountRoute('/tutors', './routes/tutors');
mountRoute('/staff', './routes/staff');
mountRoute('/classes', './routes/classes');
mountRoute('/auth', './routes/auth');
mountRoute('/timetables', './routes/timetables');
mountRoute('/inventory', './routes/inventory');
mountRoute('/finance', './routes/finance');
mountRoute('/receipts', './routes/receipt');
mountRoute('/bills', './routes/bill');
mountRoute('/invoices', './routes/invoice');
mountRoute('/reports', './routes/reports');
mountRoute('/admin', './routes/admin');
mountRoute('/admin-permissions', './routes/adminPermissions');
mountRoute('/curriculum', './routes/curriculum');
mountRoute('/alumni', './routes/alumni');
mountRoute('/feedback', './routes/feedback');
mountRoute('/quizzes', './routes/quiz');
mountRoute('/exams', './routes/exams');
mountRoute('/api/forums', './routes/forums');
mountRoute('/applications', './routes/applications');
mountRoute('/inquiries', './routes/inquiries');
mountRoute('/groups', './routes/groupExams');
mountRoute('/newsletter', './routes/newsletter');

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HCC - SMS - Server Running',
    tenant: 'hcc-sms',
    mountedRoutes: mountedRouteCount
  });
});

router.get('/api/health', (req, res) => {
  const hasMountErrors = routeMountErrors.length > 0;

  res.status(hasMountErrors ? 500 : 200).json({
    status: hasMountErrors ? 'error' : 'success',
    tenant: 'hcc-sms',
    mountedRoutes: mountedRouteCount,
    failedRouteMounts: routeMountErrors.length,
    routeMountErrors,
    message: mountedRouteCount > 0
      ? 'HCC SMS tenant routes are mounted'
      : 'HCC SMS tenant shell is mounted. Copy the server files into this folder to enable the full API.',
    timestamp: new Date().toISOString()
  });
});

router.use((req, res) => {
  res.status(404).json({
    status: 'error',
    tenant: 'hcc-sms',
    message: 'HCC SMS route not found',
    path: req.originalUrl,
    mountedRoutes: mountedRouteCount,
    failedRouteMounts: routeMountErrors.length,
    routeMountErrors
  });
});

module.exports = router;
