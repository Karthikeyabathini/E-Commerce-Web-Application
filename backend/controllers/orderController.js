const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  const { shippingAddress, phone, paymentMethod } = req.body;

  try {
    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('products.product');

    if (!cart || cart.products.length === 0) {
      res.status(400);
      throw new Error('Your cart is empty. Cannot place an order.');
    }

    // 2. Map products & verify stock
    const orderedProducts = [];
    for (const item of cart.products) {
      const product = item.product;
      if (!product) {
        res.status(404);
        throw new Error('One of the products in your cart no longer exists.');
      }

      if (product.stock < item.quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      orderedProducts.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0] || '/uploads/placeholder.jpg',
      });
    }

    // 3. Calculate financial breakdown
    const itemsPrice = cart.total;
    const taxPrice = Number((itemsPrice * 0.08).toFixed(2)); // 8% sales tax
    const shippingPrice = itemsPrice > 1000 ? 0 : 50; // free shipping over ₹1000, else ₹50
    const totalAmount = Number((itemsPrice + taxPrice + shippingPrice).toFixed(2));

    // 4. Create the Order
    const order = new Order({
      user: req.user._id,
      orderedProducts,
      shippingAddress,
      phone,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalAmount,
      isPaid: paymentMethod === 'Credit/Debit Card' || paymentMethod === 'UPI', // Auto-pay mock payment methods
      paidAt: (paymentMethod === 'Credit/Debit Card' || paymentMethod === 'UPI') ? new Date() : null,
    });

    const createdOrder = await order.save();

    // 5. Update Stock in DB
    for (const item of cart.products) {
      const product = item.product;
      product.stock -= item.quantity;
      await product.save();
    }

    // 6. Clear user's Cart
    cart.products = [];
    cart.total = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully!',
      order: createdOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Check if requester is the owner of the order or an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Access denied: You are not authorized to view this order');
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    const previousStatus = order.orderStatus;

    if (previousStatus === 'Cancelled') {
      res.status(400);
      throw new Error('Cannot change status of a Cancelled order');
    }

    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      // Revert product stock
      for (const item of order.orderedProducts) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.orderStatus = status;

    if (status === 'Delivered') {
      order.isPaid = true;
      order.paidAt = new Date();
    }

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // If deleting an order that isn't cancelled, we might want to restore stock, but let's just delete it
      await order.deleteOne();
      res.json({ success: true, message: 'Order removed successfully' });
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};
