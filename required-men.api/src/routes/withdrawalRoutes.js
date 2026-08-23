const express = require('express');
const router = express.Router();
const WithdrawalController = require('../controllers/withdrawalController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// GET /api/withdrawals/my
router.get('/my', verifyToken, authorizeRole('user'), WithdrawalController.getMyWithdrawals);

// POST /api/withdrawals
router.post('/', verifyToken, authorizeRole('user'), WithdrawalController.requestWithdrawal);

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /api/withdrawals
router.get('/', verifyToken, authorizeRole('admin', 'super_admin'), WithdrawalController.getAllWithdrawals);

// PATCH /api/withdrawals/:id/status
router.patch('/:id/status', verifyToken, authorizeRole('admin', 'super_admin'), WithdrawalController.updateWithdrawalStatus);

module.exports = router;
