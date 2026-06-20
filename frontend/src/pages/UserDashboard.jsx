import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, ShoppingBag, Lock, MapPin, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/axios';

export default function UserDashboard() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [showPwd, setShowPwd] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: errorsProfile },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
      country: user?.address?.country || '',
    }
  });

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    watch,
    reset: resetPwdForm,
    formState: { errors: errorsPwd },
  } = useForm();

  const newPassword = watch('newPassword', '');

  // Fetch user orders when mounting the orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchMyOrders = async () => {
        try {
          setOrdersLoading(true);
          const res = await api.get('/orders/myorders');
          if (res.data.success) {
            setOrders(res.data.orders);
          }
        } catch (err) {
          console.error('Error fetching personal orders:', err);
          toast.error('Failed to load your orders feed.');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchMyOrders();
    }
  }, [activeTab]);

  const onProfileSave = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      }
    };

    try {
      setSavingProfile(true);
      const res = await updateProfile(payload);
      if (res.success) {
        toast.success('Your profile details were updated!');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An error occurred while updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const onPasswordSave = async (data) => {
    try {
      setSavingPassword(true);
      const res = await updateProfile({ password: data.newPassword });
      if (res.success) {
        toast.success('Your password was updated successfully!');
        resetPwdForm();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Failed to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Account Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Sidebar Tabs */}
        <aside className="md:col-span-1 space-y-2.5">
          <button
            onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <User className="w-4 h-4" />
            My Profile Info
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Purchase History
          </button>
          <button
            onClick={() => { setActiveTab('security'); setSelectedOrder(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'security'
                ? 'bg-accent text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Lock className="w-4 h-4" />
            Login & Security
          </button>
        </aside>

        {/* Content Box */}
        <main className="md:col-span-3 bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700/50 shadow-xs">
          
          {/* Tab 1: Profile */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
                Personal Information Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('name', { required: 'Name is required' })}
                  />
                  {errorsProfile.name && <span className="text-[10px] text-red-500 mt-1 block">{errorsProfile.name.message}</span>}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('email', { required: 'Email is required' })}
                  />
                  {errorsProfile.email && <span className="text-[10px] text-red-500 mt-1 block">{errorsProfile.email.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Phone Number</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('phone')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Avatar Image Link</label>
                  <input
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('avatar')}
                  />
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-800 dark:text-white pt-4 pb-2 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700">
                <MapPin className="w-4 h-4 text-accent" />
                Default Shipping Address
              </h4>

              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Street Address</label>
                <input
                  type="text"
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                  {...regProfile('street')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('city')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">State / Province</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('state')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Zip / Postal Code</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('zip')}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Country</label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                    {...regProfile('country')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md disabled:bg-slate-355"
              >
                {savingProfile ? 'Saving Details...' : 'Save Profile Changes'}
              </button>
            </form>
          )}

          {/* Tab 2: Orders */}
          {activeTab === 'orders' && !selectedOrder && (
            <div className="space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
                Purchase Order Histories
              </h3>

              {ordersLoading ? (
                <div className="py-12 animate-pulse space-y-4">
                  <div className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
                  <div className="h-10 w-full bg-slate-100 dark:bg-slate-700 rounded-lg" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 italic">
                  No orders have been recorded in this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-150 dark:border-slate-700 text-slate-750 dark:text-white font-bold uppercase tracking-wider">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Shipping Status</th>
                        <th className="p-3 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-650 dark:text-slate-300 font-medium">
                      {orders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-750/30">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">{ord._id}</td>
                          <td className="p-3">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="p-3 font-bold">${ord.totalAmount?.toFixed(2)}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              ord.orderStatus === 'Delivered'
                                ? 'bg-emerald-500/10 text-emerald-555 text-emerald-500'
                                : ord.orderStatus === 'Cancelled'
                                ? 'bg-red-500/10 text-red-500'
                                : ord.orderStatus === 'Shipped'
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {ord.orderStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setSelectedOrder(ord)}
                              className="text-accent hover:underline font-bold"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Detailed single order sub view */}
          {activeTab === 'orders' && selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Order Details: #{selectedOrder._id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  Back to List
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
                <div>
                  <p className="text-slate-405 text-slate-400 uppercase font-semibold">Status</p>
                  <p className="font-bold text-accent mt-0.5">{selectedOrder.orderStatus}</p>
                </div>
                <div>
                  <p className="text-slate-405 text-slate-400 uppercase font-semibold">Logistics Carrier</p>
                  <p className="font-bold mt-0.5">{selectedOrder.orderStatus === 'Shipped' || selectedOrder.orderStatus === 'Delivered' ? 'FedEx Tracking (Mock)' : 'Processing items'}</p>
                </div>
                <div>
                  <p className="text-slate-405 text-slate-400 uppercase font-semibold">Receipt Invoice</p>
                  <button
                    onClick={() => window.open(`/invoice/${selectedOrder._id}`, '_blank')}
                    className="font-bold text-accent hover:underline mt-0.5 block"
                  >
                    Open PDF printable
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Ordered Products</h4>
                <div className="space-y-2">
                  {selectedOrder.orderedProducts?.map((item) => (
                    <div key={item._id || item.product} className="flex justify-between items-center gap-3 text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={item.image} alt="" className="w-8 h-8 object-cover rounded bg-slate-50 dark:bg-slate-900 flex-shrink-0" onError={(e) => {e.target.src = '/uploads/placeholder.jpg';}} />
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate max-w-sm">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.quantity} x ${item.price?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 pt-4 text-xs space-y-2 text-slate-600 dark:text-slate-350">
                <div className="flex justify-between">
                  <span>Sales Tax (8%)</span>
                  <span>${selectedOrder.taxPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Logistics</span>
                  <span>${selectedOrder.shippingPrice?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Paid</span>
                  <span className="text-accent">${selectedOrder.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security */}
          {activeTab === 'security' && (
            <form onSubmit={handlePwdSubmit(onPasswordSave)} className="space-y-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700">
                Security Password Settings
              </h3>

              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">New Password</label>
                <div className="relative max-w-md">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                      errorsPwd.newPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                    }`}
                    {...regPwd('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-3 text-slate-450 hover:text-slate-600 dark:hover:text-white"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errorsPwd.newPassword && <span className="text-[10px] text-red-500 mt-1 block">{errorsPwd.newPassword.message}</span>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  className={`w-full max-w-md bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                    errorsPwd.confirmNewPassword ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                  }`}
                  {...regPwd('confirmNewPassword', {
                    required: 'Please confirm your new password',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />
                {errorsPwd.confirmNewPassword && <span className="text-[10px] text-red-500 mt-1 block">{errorsPwd.confirmNewPassword.message}</span>}
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow-md disabled:bg-slate-300"
              >
                {savingPassword ? 'Updating Password...' : 'Change Password'}
              </button>
            </form>
          )}

        </main>

      </div>
    </div>
  );
}
