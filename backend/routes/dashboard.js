const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, authorize } = require('../middleware/auth');

router.get('/admin', auth, authorize('admin'), dashboardController.getAdminDashboard);
router.get('/customer', auth, authorize('customer'), dashboardController.getCustomerDashboard);
router.get('/supplier', auth, authorize('supplier'), dashboardController.getSupplierDashboard);

module.exports = router;
