const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', auth, routeController.getRoutes);
router.post('/', auth, authorize('admin'), logActivity('create', 'route'), routeController.createRoute);
router.put('/:id', auth, authorize('admin', 'supplier'), logActivity('update', 'route'), routeController.updateRoute);
router.get('/date/:date', auth, routeController.getRoutesByDate);

module.exports = router;
