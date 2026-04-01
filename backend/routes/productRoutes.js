const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
	getAllProducts,
	getProductBySlug,
	getProductReviewsBySlug,
	createProductReviewBySlug
} = require('../controllers/productController');

// PUBLIC: Anyone can browse the groceries
router.get('/', getAllProducts);
router.get('/:slug/reviews', getProductReviewsBySlug);
router.post('/:slug/reviews', verifyToken, createProductReviewBySlug);
router.get('/:slug', getProductBySlug);

module.exports = router;