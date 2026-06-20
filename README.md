# ShopSphere - Full-Stack E-Commerce Web Application

ShopSphere is a modern, responsive, production-ready full-stack E-Commerce application. It features a complete shopping flow (product browsing, search suggestions, filters, shopping cart drawer, secure checkout, invoice receipt downloads, product reviews) and a beautiful admin panel for dashboard metrics and CRUD management.

---

## Technical Architecture

### Tech Stack
- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons, Axios, React Router DOM, React Hook Form, React Toastify.
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs, Multer, CORS, dotenv, morgan.
- **Database:** MongoDB with Mongoose.

---

## Folder Structure

```
e-commerence/
├── backend/
│   ├── config/             # Database connections configuration
│   ├── controllers/        # Express request handler controllers (MVC)
│   ├── middleware/         # Auth guards, image uploads, error handlers
│   ├── models/             # Mongoose schemas (User, Product, Category, Cart, Order, Review)
│   ├── routes/             # Express routes definition mapping
│   ├── scripts/            # Database seed scripts
│   ├── uploads/            # Local product images upload directory
│   ├── utils/              # Helper utilities (JWT tokens)
│   ├── .env.example        # Environment variable templates
│   ├── package.json        # Backend dependencies & commands
│   └── server.js           # Server boot setup entry point
└── frontend/
    ├── src/
    │   ├── components/     # Reusable layout and ui elements (Navbar, Footers, Cards, Drawers)
    │   ├── context/        # Global states (Authentication, Basket Cart, Dark Mode Theme)
    │   ├── hooks/          # Custom react hook fetchers
    │   ├── pages/          # Navigation views (Home, Listing, Details, Dashboards, Invoices)
    │   ├── utils/          # Axios configurations
    │   ├── App.jsx         # Routes assembly & layouts shell
    │   ├── index.css       # Core Tailwind directives & fonts
    │   └── main.jsx        # React root index mounting
    ├── index.html          # Web shell page
    ├── package.json        # Frontend dependencies & configurations
    └── tailwind.config.js  # Styling variables
```

---

## Setup & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally (Optional: if not found, the app automatically falls back to an in-memory database server).

### 1. Run Backend Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration:
   - Copy `.env.example` to `.env`.
   - Update variables like `MONGO_URI` (if you want to connect to a cloud MongoDB Atlas database) and `JWT_SECRET`.
4. (Optional) Run the seed script:
   ```bash
   npm run seed
   ```
5. Start development server:
   ```bash
   npm run dev
   ```
   *Note: If no local database is running, the server spins up a dynamic in-memory database and auto-seeds itself on boot.*

### 2. Run Frontend Web Client
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web app at: [http://localhost:5173](http://localhost:5173)

---

## Pre-configured Accounts

During seeding, two accounts are created for immediate testing:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `adminpassword123` |
| **Standard User** | `jane@example.com` | `userpassword123` |

---

## API Endpoints Documentation

All requests use a base URI of `/api`.

### Authentication
- `POST /api/auth/register` - Create new user account.
- `POST /api/auth/login` - Verify email/password & return token.
- `GET /api/auth/profile` - Retrieve user profile details.
- `PUT /api/auth/profile` - Update profile addresses/contact values.

### Products
- `GET /api/products` - List products with advanced search queries (search, category, rating, minPrice, maxPrice, sort, page).
- `GET /api/products/:id` - Fetch detailed product specs, average rating, and customer reviews.
- `POST /api/products` - Add product entry (*Admin only*).
- `PUT /api/products/:id` - Edit product specs (*Admin only*).
- `DELETE /api/products/:id` - Remove product entry (*Admin only*).
- `POST /api/products/:id/reviews` - Submit rating stars & comment reviews.

### Categories
- `GET /api/categories` - Fetch all category tags.
- `POST /api/categories` - Create new category tag (*Admin only*).
- `PUT /api/categories/:id` - Edit category name or description (*Admin only*).
- `DELETE /api/categories/:id` - Remove category (*Admin only*).

### Shopping Cart
- `GET /api/cart` - Retrieve user's saved shopping basket.
- `POST /api/cart` - Add product/increase quantities in basket.
- `PUT /api/cart/:productId` - Overwrite item quantity in basket.
- `DELETE /api/cart/:productId` - Delete item from basket.
- `DELETE /api/cart` - Wipe entire shopping cart.

### Orders
- `POST /api/orders` - Process checkout items, decrease product stocks, and create order.
- `GET /api/orders/myorders` - List purchase histories for logged-in user.
- `GET /api/orders/:id` - Fetch order tracking, shipping, and receipt breakdowns.
- `GET /api/orders` - Fetch all client orders (*Admin only*).
- `PUT /api/orders/:id` - Adjust shipment tracker status (e.g. Processing -> Shipped) (*Admin only*).
- `DELETE /api/orders/:id` - Delete order log (*Admin only*).

### Users Control
- `GET /api/users` - View details for all registered accounts (*Admin only*).
- `PUT /api/users/:id` - Edit user role (admin <=> user) (*Admin only*).
- `DELETE /api/users/:id` - Remove user account, cart, and order details (*Admin only*).

---

## Production Deployment Blueprints

### Backend Deployment (Render.com)
1. **New Web Service:** Create a Web Service on Render and link it to your GitHub repository.
2. **Environment Configuration:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Variables:** Add the following keys in your Render settings:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *[Your MongoDB Atlas Connection String]*
   - `JWT_SECRET`: *[A long secure cryptographic string]*

### Frontend Deployment (Vercel.com)
1. **Build Settings:** Import the `frontend/` directory into a new Vercel project.
2. **Configuration:**
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables:** Add `VITE_API_URL` pointing to your deployed Render API (e.g. `https://shopsphere-api.onrender.com/api`).
