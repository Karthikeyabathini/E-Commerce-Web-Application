const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');

// @desc    Get all products with search, sorting, filtering & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      rating,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Search filter (case-insensitive regex on name and description)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 2. Category filter
    if (category) {
      // Find category by name or ID
      const cat = await Category.findOne({
        $or: [
          { name: { $regex: `^${category}$`, $options: 'i' } },
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
        ].filter(Boolean),
      });

      if (cat) {
        query.category = cat._id;
      } else {
        // If category is not found, return empty results
        return res.json({
          success: true,
          products: [],
          page: Number(page),
          pages: 0,
          count: 0,
        });
      }
    }

    // 3. Rating filter (greater than or equal to rating query)
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 4. Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 5. Sorting
    let sortQuery = { createdAt: -1 }; // Default: Newest
    if (sort) {
      if (sort === 'priceAsc') {
        sortQuery = { price: 1 };
      } else if (sort === 'priceDesc') {
        sortQuery = { price: -1 };
      } else if (sort === 'newest') {
        sortQuery = { createdAt: -1 };
      } else if (sort === 'popular') {
        sortQuery = { rating: -1, numReviews: -1 };
      }
    }

    // 6. Pagination
    const count = await Product.countDocuments(query);
    const pages = Math.ceil(count / Number(limit));
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      products,
      page: Number(page),
      pages,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product details by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate({
        path: 'reviews',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'user', select: 'name avatar' },
      });

    if (product) {
      res.json({ success: true, product });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  const { name, description, price, category, stock, images } = req.body;

  try {
    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error('Please enter all required fields: name, description, price, category');
    }

    // Handle files if uploaded via multer
    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (images) {
      productImages = Array.isArray(images) ? images : [images];
    }

    // Set default fallback image if none provided
    if (productImages.length === 0) {
      productImages.push('/uploads/placeholder.jpg');
    }

    // Validate category existence
    const cat = await Category.findById(category);
    if (!cat) {
      res.status(400);
      throw new Error('Invalid Category ID');
    }

    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: stock ? Number(stock) : 0,
      images: productImages,
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  const { name, description, price, category, stock, images } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Validate category existence if provided
      if (category) {
        const cat = await Category.findById(category);
        if (!cat) {
          res.status(400);
          throw new Error('Invalid Category ID');
        }
        product.category = category;
      }

      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price !== undefined ? Number(price) : product.price;
      product.stock = stock !== undefined ? Number(stock) : product.stock;

      // Handle images updates
      let productImages = [...product.images];
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/${file.filename}`);
        productImages = newImages; // replace or append depending on preference, here we replace
      } else if (images) {
        productImages = Array.isArray(images) ? images : [images];
      }
      product.images = productImages;

      const updatedProduct = await product.save();
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Delete any associated reviews
      await Review.deleteMany({ product: product._id });

      await product.deleteOne();
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user already reviewed
      const alreadyReviewed = await Review.findOne({
        user: req.user._id,
        product: product._id,
      });

      if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed by this user');
      }

      const review = new Review({
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        product: product._id,
      });

      const savedReview = await review.save();

      // Push review ID to product reviews
      product.reviews.push(savedReview._id);
      product.numReviews = product.reviews.length;

      // Recalculate rating
      const reviews = await Review.find({ product: product._id });
      product.rating =
        reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

      await product.save();
      res.status(201).json({ success: true, message: 'Review added successfully' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
};
