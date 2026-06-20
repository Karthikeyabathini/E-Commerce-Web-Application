import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ShoppingCartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, cartSubtotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              Shopping Cart ({cartItems.length})
            </h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 py-6 overflow-y-auto px-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <ShoppingBag className="w-16 h-16 stroke-1" />
                <p className="text-center text-sm">Your shopping cart is empty.</p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg font-medium text-sm transition-colors shadow-xs"
                >
                  Start Browsing
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.product._id} className="flex py-2 border-b border-slate-50 dark:border-slate-700/50 pb-4">
                  {/* Image */}
                  <img
                    src={item.product.images?.[0] || '/uploads/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-slate-50 dark:bg-slate-900"
                    onError={(e) => {
                      e.target.src = '/uploads/placeholder.jpg';
                    }}
                  />
                  {/* Details */}
                  <div className="ml-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-slate-800 dark:text-slate-100 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-accent">
                        ${(item.product.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-sm font-medium text-slate-700 dark:text-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                          className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Delete button */}
                      <button
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Billing & Checkout Summary */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-700 px-6 py-6 bg-slate-50 dark:bg-slate-900/50 space-y-4">
              <div className="flex justify-between text-base font-semibold text-slate-900 dark:text-white">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Shipping and taxes will be computed at checkout.
              </p>
              <div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
