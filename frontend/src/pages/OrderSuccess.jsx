import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, Printer, Calendar } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state?.order;

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center font-sans space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Transaction Record Missing</h3>
        <p className="text-sm text-slate-500">Please visit your dashboard to check recent order histories.</p>
        <Link to="/" className="px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-sm font-semibold inline-block transition-colors">
          Go to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-sans space-y-8">
      
      {/* Visual celebration banner */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-555 text-emerald-500 mx-auto animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-500">Payment Successful</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Thank You For Your Order!</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400">
            A confirmation invoice has been recorded in your account.
          </p>
        </div>
      </div>

      {/* Summary Box card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/50 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Core fields */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pb-6 border-b border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-semibold mb-1 uppercase">Order Reference ID</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{order._id}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-semibold mb-1 uppercase">Date Purchased</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-semibold mb-1 uppercase">Billing Amount</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">${order.totalAmount?.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500 font-semibold mb-1 uppercase">Payment Option</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Ordered products preview list */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Purchased Items</h3>
          <div className="space-y-3">
            {order.orderedProducts?.map((item) => (
              <div key={item._id || item.product} className="flex justify-between items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded bg-slate-50 dark:bg-slate-900 flex-shrink-0"
                    onError={(e) => { e.target.src = '/uploads/placeholder.jpg'; }}
                  />
                  <div className="overflow-hidden">
                    <h5 className="text-slate-800 dark:text-slate-250 truncate">{item.name}</h5>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">Qty: {item.quantity} x ${item.price?.toFixed(2)}</p>
                  </div>
                </div>
                <span className="text-slate-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping details */}
        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 text-xs space-y-2">
          <h3 className="uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">Shipping Destination</h3>
          <p className="font-bold text-slate-850 dark:text-slate-200">
            {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}, {order.shippingAddress?.country}
          </p>
          <p className="text-slate-450 dark:text-slate-405 mt-1 font-medium">
            Contact phone: <span className="font-bold text-slate-800 dark:text-slate-250">{order.phone}</span>
          </p>
        </div>

      </div>

      {/* Action links */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        {/* Print Invoice button */}
        <button
          onClick={() => window.open(`/invoice/${order._id}`, '_blank')}
          className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-750 dark:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Download Invoice Receipt
        </button>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold rounded-xl text-xs text-center transition-all"
          >
            Review My Orders
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
