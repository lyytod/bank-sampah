const express = require('express');
const router = express.Router();
const DepositController = require('../controllers/depositController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// GET /api/deposits/my
// Hanya untuk user (Nasabah) melihat riwayat sektorannya sendiri
router.get('/my', verifyToken, authorizeRole('user'), DepositController.getMyDeposits);

// POST /api/deposits
// Menggunakan upload.single('photo') untuk menangani file upload dari frontend
router.post('/', verifyToken, authorizeRole('user'), upload.single('photo'), DepositController.createDeposit);

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /api/deposits
router.get('/', verifyToken, authorizeRole('admin', 'super_admin'), DepositController.getAllDeposits);

// PATCH /api/deposits/:id/status
router.patch('/:id/status', verifyToken, authorizeRole('admin', 'super_admin'), DepositController.updateDepositStatus);

module.exports = router;
