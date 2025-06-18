const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/analyticsController');

// קליקים לפי מקור
router.get('/by-source', analyticsController.getClicksBySource);
// סך כל הקליקים של המשתמש
router.get('/user-total-clicks/:userId', analyticsController.getUserLinksTotalClicks);
// קליקים לפי יום
router.get('/by-day', analyticsController.getClicksByDay);

module.exports = router;
