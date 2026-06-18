const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getRelatedProducts, createProduct, updateProduct, deleteProduct, getCategories, getSeasonalProducts } = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/seasonal', getSeasonalProducts);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);
router.post('/', protect, adminMiddleware, createProduct);
router.put('/:id', protect, adminMiddleware, updateProduct);
router.delete('/:id', protect, adminMiddleware, deleteProduct);

module.exports = router;
