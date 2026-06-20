const express = require('express');
const {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getCart)
  .post(protect, addProductToCart)
  .delete(protect, clearCart);

router.route('/:productId')
  .put(protect, updateCartItemQuantity)
  .delete(protect, removeCartItem);

module.exports = router;
