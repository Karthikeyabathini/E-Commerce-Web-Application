import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    
    setIsAdding(true);
    const res = await addToCart(product, 1);
    setIsAdding(false);

    if (res?.success) {
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error(res?.message || 'Failed to add item to cart.');
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      toast.info(`${product.name} added to wishlist!`);
    } else {
      toast.info(`${product.name} removed from wishlist.`);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full font-sans relative">
      
      {/* Wishlist toggle button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-full shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
        title="Add to Wishlist"
      >
        <Heart 
          className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-550 text-red-500' : 'text-slate-400'}`} 
        />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product._id}`} className="block overflow-hidden bg-slate-50 dark:bg-slate-900 relative pt-[100%]">
        <img
          src={product.images?.[0] || '/uploads/placeholder.jpg'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/uploads/placeholder.jpg';
          }}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-xs">
            <span className="bg-red-650 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of stock
            </span>
          </div>
        )}
      </Link>

      {/* Body Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {product.category?.name || 'Category'}
          </span>
          {/* Name */}
          <Link to={`/products/${product._id}`} className="block mt-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-accent transition-colors line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating stars */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.rating || 0) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Pricing & Add Button Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            ${(product.price || 0).toFixed(2)}
          </span>

          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0 || isAdding}
            className={`p-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              product.stock === 0
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-650 cursor-not-allowed'
                : 'bg-accent hover:bg-accent-dark text-white shadow-xs hover:shadow-md'
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs font-semibold px-0.5 hidden sm:inline">
              {isAdding ? 'Adding...' : 'Add'}
            </span>
          </button>
        </div>
      </div>
      
    </div>
  );
};
