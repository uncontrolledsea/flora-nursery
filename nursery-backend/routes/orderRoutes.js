const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus, getDashboardStats } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, adminMiddleware, getAllOrders);
router.get('/admin/stats', protect, adminMiddleware, getDashboardStats);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, adminMiddleware, updateOrderStatus);

module.exports = router;
