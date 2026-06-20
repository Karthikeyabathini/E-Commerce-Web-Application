const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Helper to recalculate cart total price
const recalculateCartTotal = async (cart) => {
  let total = 0;
  for (const item of cart.products) {
    const product = await Product.findById(item.product);
    if (product) {
      total += product.price * item.quantity;
    }
  }
  cart.total = Number(total.toFixed(2));
  await cart.save();
};

// @desc    Get logged in user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'products.product',
      select: 'name price images stock category',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, products: [], total: 0 });
    }

    // Filter out items whose product might have been deleted
    const initialLength = cart.products.length;
    cart.products = cart.products.filter(item => item.product !== null);
    if (cart.products.length !== initialLength) {
      await recalculateCartTotal(cart);
      // Reload populate
      cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'products.product',
        select: 'name price images stock category',
      });
    }

    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add product to cart / Sync item
// @route   POST /api/cart
// @access  Private
const addProductToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, products: [], total: 0 });
    }

    // Check if item already in cart
    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    const qtyToAdd = Number(quantity) || 1;

    if (itemIndex > -1) {
      // Check stock limits
      const newQty = cart.products[itemIndex].quantity + qtyToAdd;
      if (newQty > product.stock) {
        res.status(400);
        throw new Error(`Cannot add more. Only ${product.stock} items left in stock.`);
      }
      cart.products[itemIndex].quantity = newQty;
    } else {
      // Check stock limits
      if (qtyToAdd > product.stock) {
        res.status(400);
        throw new Error(`Cannot add item. Only ${product.stock} items left in stock.`);
      }
      cart.products.push({ product: productId, quantity: qtyToAdd });
    }

    await recalculateCartTotal(cart);

    // Retrieve populated cart
    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'products.product',
      select: 'name price images stock category',
    });

    res.status(200).json({ success: true, cart: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart product quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res, next) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error('Product not found');
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      res.status(400);
      throw new Error('Quantity must be greater than 0');
    }

    if (qty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} items left in stock.`);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    const itemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      cart.products[itemIndex].quantity = qty;
      await recalculateCartTotal(cart);

      const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'products.product',
        select: 'name price images stock category',
      });

      res.json({ success: true, cart: populatedCart });
    } else {
      res.status(404);
      throw new Error('Item not found in cart');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Remove product from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeCartItem = async (req, res, next) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404);
      throw new Error('Cart not found');
    }

    cart.products = cart.products.filter(
      (item) => item.product.toString() !== productId
    );

    await recalculateCartTotal(cart);

    const populatedCart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'products.product',
      select: 'name price images stock category',
    });

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.products = [];
      cart.total = 0;
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};
