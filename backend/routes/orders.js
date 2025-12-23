const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', auth, orderController.getOrders);
router.post('/', auth, authorize('customer', 'admin'), logActivity('create', 'order'), orderController.createOrder);
router.put('/:id', auth, authorize('admin'), logActivity('update', 'order'), orderController.updateOrder);
router.put('/:id/assign', auth, authorize('admin'), logActivity('update', 'order'), orderController.assignOrder);
router.delete('/:id', auth, logActivity('delete', 'order'), orderController.cancelOrder);

module.exports = router;
