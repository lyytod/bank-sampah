const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// GET /api/locations (Bisa diakses oleh semua role yang sudah login, untuk dropdown setoran)
router.get('/', verifyToken, LocationController.getAll);

// Route khusus Admin & Super Admin
router.post('/', verifyToken, authorizeRole('admin', 'super_admin'), LocationController.createLocation);
router.put('/:id', verifyToken, authorizeRole('admin', 'super_admin'), LocationController.updateLocation);
router.patch('/:id/toggle', verifyToken, authorizeRole('admin', 'super_admin'), LocationController.toggleActive);
router.delete('/:id', verifyToken, authorizeRole('admin', 'super_admin'), LocationController.deleteLocation);

module.exports = router;
