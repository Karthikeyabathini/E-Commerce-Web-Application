import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Phone, MapPin, ClipboardList, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/axios';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartSubtotal, taxPrice, shippingPrice, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  // Set default values from User object if they already exist
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
      country: user?.address?.country || '',
      phone: user?.phone || '',
      paymentMethod: 'Cash on Delivery',
    }
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      toast.warning('Your shopping cart is empty. Please add items before checking out.');
      navigate('/products');
    }
  }, [cartItems, navigate]);

  const onSubmit = async (data) => {
    const payload = {
      shippingAddress: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      },
      phone: data.phone,
      paymentMethod: data.paymentMethod,
    };

    try {
      setLoading(true);
      const res = await api.post('/orders', payload);
      if (res.data.success) {
        toast.success(res.data.message || 'Order placed successfully!');
        const placedOrder = res.data.order;
        
        // Empty Cart Context locally
        await clearCart();
        
        // Redirect to success page, pass order details
        navigate('/order-success', { state: { order: placedOrder } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process order checkout. Verify stock levels.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-8">Secure Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Details (Col span 2) */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          
          {/* Shipping Address Container */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-855 text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              1. Delivery Shipping Address
            </h3>
            
            {/* Street */}
            <div>
              <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Street Address</label>
              <input
                type="text"
                placeholder="Apartment, suite, unit, building, floor, street number"
                className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                  errors.street ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                }`}
                {...register('street', { required: 'Street address is required' })}
              />
              {errors.street && <span className="text-[10px] text-red-500 mt-1 block">{errors.street.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">City</label>
                <input
                  type="text"
                  placeholder="New York"
                  className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                    errors.city ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                  }`}
                  {...register('city', { required: 'City is required' })}
                />
                {errors.city && <span className="text-[10px] text-red-500 mt-1 block">{errors.city.message}</span>}
              </div>

              {/* State */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">State / Province</label>
                <input
                  type="text"
                  placeholder="NY"
                  className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                    errors.state ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                  }`}
                  {...register('state', { required: 'State is required' })}
                />
                {errors.state && <span className="text-[10px] text-red-500 mt-1 block">{errors.state.message}</span>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Zip code */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Zip / Postal Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                    errors.zip ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                  }`}
                  {...register('zip', { required: 'Zip code is required' })}
                />
                {errors.zip && <span className="text-[10px] text-red-500 mt-1 block">{errors.zip.message}</span>}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Country</label>
                <input
                  type="text"
                  placeholder="USA"
                  className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                    errors.country ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                  }`}
                  {...register('country', { required: 'Country is required' })}
                />
                {errors.country && <span className="text-[10px] text-red-500 mt-1 block">{errors.country.message}</span>}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent" />
              2. Contact Information
            </h3>
            <div>
              <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Phone Number</label>
              <input
                type="tel"
                placeholder="10 digit mobile number"
                className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent ${
                  errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-650'
                }`}
                {...register('phone', {
                  required: 'Phone number is required',
                  minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
                })}
              />
              {errors.phone && <span className="text-[10px] text-red-500 mt-1 block">{errors.phone.message}</span>}
            </div>
          </div>

          {/* Payment selection */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-accent" />
              3. Select Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  value="Cash on Delivery"
                  className="accent-accent"
                  {...register('paymentMethod')}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-250">Cash on Delivery</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pay at your doorstep</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  value="Credit/Debit Card"
                  className="accent-accent"
                  {...register('paymentMethod')}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-250">Card Payment (Mock)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Instant secure clearance</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800">
                <input
                  type="radio"
                  value="UPI"
                  className="accent-accent"
                  {...register('paymentMethod')}
                />
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-250">UPI / QR Code (Mock)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Scan to pay instantly</p>
                </div>
              </label>

            </div>
          </div>

          {/* Place order CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent hover:bg-accent-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Completing Transaction...' : 'Place Secure Order'}
          </button>

        </form>

        {/* Right Column: Order breakdown summary */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-4 sticky top-24">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-700">
              <ClipboardList className="w-4 h-4 text-accent" />
              Order Summary
            </h3>

            {/* List items scroll */}
            <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex justify-between gap-3 text-xs">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{item.product.name}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Quantity: {item.quantity} x ${item.product.price?.toFixed(2)}</p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">${((item.product.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculation lines */}
            <div className="border-t border-slate-100 dark:border-slate-700 pt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-350">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Logistics</span>
                <span className="font-semibold text-slate-850 dark:text-slate-200">
                  {shippingPrice === 0 ? <span className="text-emerald-555 text-emerald-500 font-bold">FREE</span> : `$${shippingPrice.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-700 pt-3 text-sm font-bold text-slate-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-accent">${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 pt-2">
              <Lock className="w-3.5 h-3.5" />
              128-bit SSL encrypted connection
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
