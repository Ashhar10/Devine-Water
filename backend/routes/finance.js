const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/incoming', auth, financeController.getIncoming);
router.post('/incoming', auth, logActivity('create', 'finance'), financeController.addIncoming);
router.get('/outgoing', auth, authorize('admin'), financeController.getOutgoing);
router.post('/outgoing', auth, authorize('admin'), logActivity('create', 'finance'), financeController.addExpense);
router.get('/reports', auth, authorize('admin'), financeController.getReports);

module.exports = router;
