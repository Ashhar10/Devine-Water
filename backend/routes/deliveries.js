const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', auth, deliveryController.getDeliveries);
router.put('/:id/status', auth, authorize('supplier', 'admin'), logActivity('update', 'delivery'), deliveryController.updateDeliveryStatus);
router.get('/supplier/:id', auth, authorize('admin'), deliveryController.getSupplierDeliveries);

module.exports = router;
