const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, authorize('admin'), logController.getLogs);
router.get('/user/:id', auth, authorize('admin'), logController.getUserActivity);

module.exports = router;
