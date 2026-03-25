const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const { createProduct, getAllProducts } = require('../controllers/productController');

// PUBLIC: Anyone can browse the groceries
router.get('/', getAllProducts);

// PRIVATE: Anyone logged in can see their own profile or specific data
// router.get('/me', verifyToken, userController.getProfile);

// ADMIN ONLY: Only admins can add or delete grocery items
router.post('/add', verifyToken, isAdmin, createProduct);

module.exports = router;