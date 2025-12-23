const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.get('/', auth, authorize('admin'), userController.getAllUsers);
router.post('/', auth, authorize('admin'), logActivity('create', 'user'), userController.createUser);
router.put('/:id', auth, authorize('admin'), logActivity('update', 'user'), userController.updateUser);
router.delete('/:id', auth, authorize('admin'), logActivity('delete', 'user'), userController.deleteUser);

module.exports = router;
