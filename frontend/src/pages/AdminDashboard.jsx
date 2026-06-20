import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BarChart3, Package, ShoppingCart, Users, FolderPlus, Plus, Pencil, Trash2, Eye, X, Upload } from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  
  // Dashboard states
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  // Forms
  const { register: regProd, handleSubmit: handleProdSubmit, reset: resetProdForm, setValue: setProdValue } = useForm();
  const { register: regCat, handleSubmit: handleCatSubmit, reset: resetCatForm } = useForm();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, productsRes, categoriesRes, ordersRes] = await Promise.all([
        api.get('/users'),
        api.get('/products?limit=100'),
        api.get('/categories'),
        api.get('/orders'),
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (productsRes.data.success) setProducts(productsRes.data.products);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      toast.error('Failed to load administrative details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // calculations
  const totalUsers = users.length;
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((ord) => ord.orderStatus !== 'Cancelled')
    .reduce((acc, ord) => acc + ord.totalAmount, 0);

  // Product CRUD functions
  const openAddProductModal = () => {
    setEditingProduct(null);
    resetProdForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: categories[0]?._id || '',
      images: '',
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    resetProdForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category?._id || product.category,
      images: product.images.join(', '),
    });
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (data) => {
    // Process image paths (split by comma)
    const imgArray = data.images
      ? data.images.split(',').map((img) => img.trim()).filter(Boolean)
      : [];

    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.category,
      images: imgArray,
    };

    try {
      if (editingProduct) {
        // Edit mode
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        if (res.data.success) {
          toast.success('Product updated successfully!');
          setProductModalOpen(false);
          fetchDashboardData();
        }
      } else {
        // Create mode
        const res = await api.post('/products', payload);
        if (res.data.success) {
          toast.success('New product created successfully!');
          setProductModalOpen(false);
          fetchDashboardData();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit product details.');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await api.delete(`/products/${prodId}`);
      if (res.data.success) {
        toast.success('Product removed successfully.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  // Category functions
  const handleCreateCategory = async (data) => {
    try {
      const res = await api.post('/categories', data);
      if (res.data.success) {
        toast.success('Category created successfully!');
        resetCatForm();
        setCategoryModalOpen(false);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        toast.success('Category removed successfully.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove category.');
    }
  };

  // Order operations
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Order status updated to "${newStatus}"`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order log permanently?')) return;
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        toast.success('Order deleted.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete order.');
    }
  };

  // User actions
  const handleUserRoleUpdate = async (userId, activeRole) => {
    const nextRole = activeRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to toggle this user to ${nextRole}?`)) return;
    try {
      const res = await api.put(`/users/${userId}`, { role: nextRole });
      if (res.data.success) {
        toast.success(`User role adjusted to "${nextRole}"`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user, their cart, and their orders?')) return;
    try {
      const res = await api.delete(`/users/${userId}`);
      if (res.data.success) {
        toast.success('User and their data removed.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Administrative Control Panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Management Control Center</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Review metrics, edit stocks, adjust categories, trace orders, and override roles</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2.5 mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'stats'
              ? 'bg-accent text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Metrics Overview
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'products'
              ? 'bg-accent text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Package className="w-4 h-4" />
          Product CRUD
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'categories'
              ? 'bg-accent text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <FolderPlus className="w-4 h-4" />
          Category Manager
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'orders'
              ? 'bg-accent text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Order Tracker
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'users'
              ? 'bg-accent text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Users Manager
        </button>
      </div>

      {/* Metrics Section */}
      {activeTab === 'stats' && (
        <div className="space-y-8">
          {/* Numbers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-amber-500/10 rounded-2xl text-accent"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Total Users</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalUsers}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><Package className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Active Products</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalProducts}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-550 text-indigo-500"><ShoppingCart className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-555 text-slate-400">Total Orders</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalOrders}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-555 text-rose-500"><BarChart3 className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-550">Total Revenue</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Quick lists summaries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent orders card list */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Recent Incoming Orders</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No orders received.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((ord) => (
                    <div key={ord._id} className="flex justify-between items-center text-xs font-semibold">
                      <div>
                        <p className="text-slate-800 dark:text-slate-200">Customer: {ord.user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium mt-0.5">Value: ${ord.totalAmount.toFixed(2)} | Status: <span className="text-accent">{ord.orderStatus}</span></p>
                      </div>
                      <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Out of stock product notices list */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">Out of Stock & Low Stock Warnings</h3>
              {products.filter(p => p.stock <= 5).length === 0 ? (
                <p className="text-xs text-slate-450 dark:text-slate-400 italic">All items are sufficiently stocked.</p>
              ) : (
                <div className="space-y-3">
                  {products.filter(p => p.stock <= 5).slice(0, 5).map((prod) => (
                    <div key={prod._id} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{prod.name}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${prod.stock === 0 ? 'bg-red-500/10 text-red-550 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {prod.stock === 0 ? 'WIPED OUT' : `Low: ${prod.stock} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CRUD Product Management */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddProductModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Product
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-white font-bold uppercase tracking-wider">
                  <th className="p-3">Image</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Price</th>
                  <th className="p-3 text-center">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                    <td className="p-3">
                      <img src={prod.images?.[0]} alt="" className="w-8 h-8 object-cover rounded bg-slate-100 dark:bg-slate-900" onError={(e)=>{e.target.src='/uploads/placeholder.jpg';}} />
                    </td>
                    <td className="p-3 font-semibold text-slate-900 dark:text-white truncate max-w-sm">{prod.name}</td>
                    <td className="p-3 capitalize">{prod.category?.name || 'Unassigned'}</td>
                    <td className="p-3 text-center font-bold">${prod.price?.toFixed(2)}</td>
                    <td className="p-3 text-center font-bold">
                      <span className={`${prod.stock === 0 ? 'text-red-500' : prod.stock < 5 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button onClick={() => openEditProductModal(prod)} className="p-1 text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md" title="Edit Product">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(prod._id)} className="p-1 text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md" title="Delete Product">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Manager */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setCategoryModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New Category
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-white font-bold uppercase tracking-wider">
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-350 font-medium">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white capitalize">{cat.name}</td>
                    <td className="p-3 truncate max-w-md">{cat.description || <span className="text-slate-400 italic">No Description</span>}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleDeleteCategory(cat._id)} className="p-1 text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md" title="Delete Category">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Tracker */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-white font-bold uppercase tracking-wider">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer User</th>
                <th className="p-3 text-center">Purchased Date</th>
                <th className="p-3 text-center">Billing Total</th>
                <th className="p-3 text-center">Payment Status</th>
                <th className="p-3 text-center">Logistics Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-350 font-medium">
              {orders.map((ord) => (
                <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{ord._id}</td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-850 dark:text-slate-200">{ord.user?.name || <span className="text-slate-400 italic">Deleted user</span>}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ord.user?.email}</p>
                  </td>
                  <td className="p-3 text-center">
                    {new Date(ord.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-center font-bold">${ord.totalAmount?.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${ord.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {ord.isPaid ? 'PAID' : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) => handleOrderStatusUpdate(ord._id, e.target.value)}
                      disabled={ord.orderStatus === 'Cancelled'}
                      className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg text-xs font-semibold px-2 py-1 focus:border-accent cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => window.open(`/invoice/${ord._id}`, '_blank')} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white mr-1.5" title="Print Invoice">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteOrder(ord._id)} className="p-1 text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md" title="Remove Order Log">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Manager */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 text-slate-700 dark:text-white font-bold uppercase tracking-wider">
                <th className="p-3">User Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3 text-center">Active Authority Role</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-600 dark:text-slate-350 font-medium">
              {users.map((usr) => (
                <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white capitalize">{usr.name}</td>
                  <td className="p-3">{usr.email}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleUserRoleUpdate(usr._id, usr.role)}
                      className={`px-3 py-1 rounded-lg font-bold text-[9px] uppercase transition-all border ${
                        usr.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-transparent'
                      }`}
                    >
                      {usr.role}
                    </button>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => handleDeleteUser(usr._id)} className="p-1 text-red-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md animate-fade-in" title="Remove User">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: Product Add / Edit */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setProductModalOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700/50 shadow-2xl w-full max-w-lg z-10 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700 mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {editingProduct ? `Edit Product: ${editingProduct.name.slice(0, 20)}...` : 'Add New Catalog Product'}
              </h3>
              <button onClick={() => setProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleProdSubmit(handleProductSubmit)} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div>
                <label className="block mb-1.5 uppercase font-bold text-slate-400">Product Name *</label>
                <input type="text" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regProd('name', { required: true })} />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold text-slate-400">Description *</label>
                <textarea rows="3" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white resize-none" {...regProd('description', { required: true })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-slate-400">Price ($) *</label>
                  <input type="number" step="0.01" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regProd('price', { required: true, min: 0 })} />
                </div>
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-slate-400">Stock Count *</label>
                  <input type="number" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regProd('stock', { required: true, min: 0 })} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold text-slate-400">Category Tag *</label>
                  <select required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white cursor-pointer" {...regProd('category', { required: true })}>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold text-slate-400">Images URL (Comma-Separated) *</label>
                <input type="text" required placeholder="https://unsplash.com/..., https://unsplash.com/..." className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regProd('images', { required: true })} />
              </div>

              <button type="submit" className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold shadow-md transition-colors mt-6">
                {editingProduct ? 'Save Product Details' : 'Create Product Entry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Category */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setCategoryModalOpen(false)} />
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-2xl w-full max-w-sm z-10">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700 mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Add Category Builders</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="text-slate-405 hover:text-slate-600 dark:hover:text-white"><X className="w-4.5 h-4.5" /></button>
            </div>

            <form onSubmit={handleCatSubmit(handleCreateCategory)} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div>
                <label className="block mb-1.5 uppercase font-bold text-slate-400">Category Name *</label>
                <input type="text" required className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regCat('name', { required: true })} />
              </div>
              <div>
                <label className="block mb-1.5 uppercase font-bold text-slate-400">Description</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-3 py-2 outline-none focus:border-accent text-slate-900 dark:text-white" {...regCat('description')} />
              </div>
              <button type="submit" className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold transition-colors mt-4">Create Category</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
