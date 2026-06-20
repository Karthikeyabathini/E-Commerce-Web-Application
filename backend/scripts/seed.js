const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const categoriesData = [
  { name: 'Electronics', description: 'Smartphones, laptops, smartwatches, and gadgets' },
  { name: 'Fashion', description: 'Premium clothing, shoes, and accessories' },
  { name: 'Home & Living', description: 'Home decor, furniture, kitchenware, and organization' },
  { name: 'Fitness & Outdoors', description: 'Gym equipment, tracking gears, and outdoor essentials' }
];

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'adminpassword123',
    role: 'admin',
    phone: '1234567890',
    address: {
      street: '100 Admin HQ Way',
      city: 'Silicon Valley',
      state: 'CA',
      zip: '94025',
      country: 'USA'
    }
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'userpassword123',
    role: 'user',
    phone: '9876543210',
    address: {
      street: '456 Willow Avenue',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'USA'
    }
  }
];

const productsData = [
  // Electronics
  {
    name: 'AeroMax Pro Noise Cancelling Headphones',
    description: 'Experience pure acoustic bliss with custom-tuned 40m drivers, active hybrid noise cancellation (ANC), transparency mode, and 45 hours of battery life. Designed with memory foam cups for all-day comfort.',
    price: 249.99,
    categoryName: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 25,
    rating: 4.8,
    numReviews: 0
  },
  {
    name: 'Chronos Smartwatch Series 5',
    description: 'Track your activity, monitor your heart rate, measure sleep patterns, and receive notifications. Features an always-on AMOLED touchscreen display, water resistance up to 50m, and GPS tracking.',
    price: 189.50,
    categoryName: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    rating: 4.2,
    numReviews: 0
  },
  {
    name: 'Titanium Mechanical Keyboard (Custom Brown Switches)',
    description: 'An elegant 75% mechanical keyboard featuring solid CNC aluminum case, double-shot PBT keycaps, hot-swappable switches, and fully customizable per-key RGB backlighting. Premium sound dampening included.',
    price: 145.00,
    categoryName: 'Electronics',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    rating: 4.6,
    numReviews: 0
  },

  // Fashion
  {
    name: 'Signature Waterproof Explorer Backpack',
    description: 'Designed for commuting and outdoor travels. Features a water-resistant 1000D Nylon exterior, a padded 16-inch laptop pocket, quick-access document pouches, and ergonomic chest straps.',
    price: 79.99,
    categoryName: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 40,
    rating: 4.5,
    numReviews: 0
  },
  {
    name: 'Urban Knit Breathable Running Sneakers',
    description: 'Lightweight, breathable knit upper that fits like a sock. Features responsive cushioning foam and a durable rubber outsole for high energy returns. Perfect for road running or walking.',
    price: 110.00,
    categoryName: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 15,
    rating: 4.4,
    numReviews: 0
  },
  {
    name: 'Premium Wool Blend Double-Breasted Trenchcoat',
    description: 'Tailored using thick wool blend fabrics to provide high insulation and classic styling. Double-breasted closure, adjustable belt, and deep inner utility pockets.',
    price: 195.00,
    categoryName: 'Fashion',
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 8,
    rating: 4.7,
    numReviews: 0
  },

  // Home & Living
  {
    name: 'Aroma-Mist Ceramic Essential Oil Diffuser',
    description: 'An elegant textured ceramic diffuser that operates silently. Features auto-shutoff, warm ambient LED glow lights, and fine misting settings for rooms up to 300 sq.ft.',
    price: 49.99,
    categoryName: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    rating: 4.3,
    numReviews: 0
  },
  {
    name: 'Minimalist Walnut Wood Desk Organizer',
    description: 'Handcrafted from single-piece solid walnut timber. Includes a phone stand, pen slots, tray storage for clips, and magnetic paperclip hold. Enhances workspace efficiency beautifully.',
    price: 38.00,
    categoryName: 'Home & Living',
    images: [
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 30,
    rating: 4.0,
    numReviews: 0
  },

  // Fitness & Outdoors
  {
    name: 'AeroGrip Professional Kettlebell (16kg)',
    description: 'Cast iron kettlebell finished with a powder coat paint to prevent rust and improve grip. Color-coded handles for quick Weight recognition. Engineered for swing and press workouts.',
    price: 65.00,
    categoryName: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 14,
    rating: 4.7,
    numReviews: 0
  },
  {
    name: 'ThermaCore Stainless Insulated Water Flask',
    description: 'Double-walled vacuum insulated flask keeping liquids cold for 24 hours or hot for 12 hours. Constructed with 18/8 food-grade stainless steel. Leak-proof sport cap included.',
    price: 32.50,
    categoryName: 'Fitness & Outdoors',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 60,
    rating: 4.5,
    numReviews: 0
  }
];

const seedDatabaseData = async () => {
  try {
    // 1. Wipe collections
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Review.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();

    console.log('Database collections wiped.');

    // 2. Create Categories
    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`${seededCategories.length} categories created.`);

    // 3. Create Users
    const createdUsers = [];
    for (const u of usersData) {
      const user = await User.create(u);
      createdUsers.push(user);
    }
    console.log(`${createdUsers.length} users created.`);

    // 4. Create Products
    const categoryMap = {};
    seededCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    const productsToInsert = productsData.map((prod) => {
      const catId = categoryMap[prod.categoryName];
      return {
        ...prod,
        category: catId
      };
    });

    const seededProducts = await Product.insertMany(productsToInsert);
    console.log(`${seededProducts.length} products seeded.`);

    // 5. Create Carts
    for (const user of createdUsers) {
      await Cart.create({
        user: user._id,
        products: [],
        total: 0
      });
    }

    // Ensure uploads placeholder is there
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const placeholderPath = path.join(uploadsDir, 'placeholder.jpg');
    if (!fs.existsSync(placeholderPath)) {
      fs.writeFileSync(placeholderPath, '');
    }

    console.log('Seeding process executed successfully! 🎉');
    return true;
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    throw error;
  }
};

// If run directly via node scripts/seed.js
if (require.main === module) {
  const runDirectly = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce');
      console.log('Seeding directly connected to database...');
      await seedDatabaseData();
      process.exit(0);
    } catch (err) {
      console.error('Seeding process failed:', err);
      process.exit(1);
    }
  };
  runDirectly();
}

module.exports = seedDatabaseData;
