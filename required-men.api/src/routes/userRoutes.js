const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Semua route di sini khusus untuk Super Admin
router.use(verifyToken, authorizeRole('super_admin'));

// GET /api/users
router.get('/', UserController.getAllUsers);

// PATCH /api/users/:id/role
router.patch('/:id/role', UserController.updateRole);

// PATCH /api/users/:id/status
router.patch('/:id/status', UserController.updateStatus);

module.exports = router;
