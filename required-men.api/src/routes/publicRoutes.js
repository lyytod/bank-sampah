const express = require('express');
const router = express.Router();
const PublicController = require('../controllers/publicController');

// GET /api/public/categories (Mendukung pagination ?page=x&limit=y)
router.get('/categories', PublicController.getCategories);

// GET /api/public/stats
router.get('/stats', PublicController.getStats);

// GET /api/public/locations
router.get('/locations', PublicController.getLocations);

module.exports = router;
