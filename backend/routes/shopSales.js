const express = require('express');
const router = express.Router();
const shopSaleController = require('../controllers/shopSaleController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', auth, authorize('admin', 'shopkeeper'), shopSaleController.getSales);
router.post('/', auth, authorize('shopkeeper'), logActivity('create', 'shop_sale'), shopSaleController.recordSale);
router.get('/daily', auth, authorize('admin', 'shopkeeper'), shopSaleController.getDailySales);

module.exports = router;
