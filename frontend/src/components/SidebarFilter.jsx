import React, { useState, useEffect } from 'react';
import { Star, RotateCcw, SlidersHorizontal } from 'lucide-react';
import api from '../utils/axios';

export const SidebarFilter = ({
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  selectedRating,
  onRatingChange,
  onClearFilters,
}) => {
  const [categories, setCategories] = useState([]);
  const [priceInput, setPriceInput] = useState({ min: minPrice || '', max: maxPrice || '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories in filters:', err);
      }
    };
    fetchCategories();
  }, []);

  // Sync inputs with parent state on clear
  useEffect(() => {
    setPriceInput({ min: minPrice || '', max: maxPrice || '' });
  }, [minPrice, maxPrice]);

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    onPriceChange(priceInput.min, priceInput.max);
  };

  const handleReset = () => {
    setPriceInput({ min: '', max: '' });
    onClearFilters();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs font-sans space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white">
          <SlidersHorizontal className="w-4 h-4 text-accent" />
          Filter Options
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-accent flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset All
        </button>
      </div>

      {/* Category Section */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
          Category
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
              selectedCategory === ''
                ? 'bg-slate-100 dark:bg-slate-700 font-semibold text-accent'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-650 dark:text-slate-350'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onCategoryChange(cat.name)}
              className={`w-full text-left text-sm py-1 px-2 rounded-lg transition-colors capitalize ${
                selectedCategory === cat.name
                  ? 'bg-slate-100 dark:bg-slate-700 font-semibold text-accent'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-650 dark:text-slate-350'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price filter Section */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
          Price Range ($)
        </h4>
        <form onSubmit={handlePriceSubmit} className="space-y-3">
          <div className="flex gap-2.5 items-center">
            <input
              type="number"
              placeholder="Min"
              value={priceInput.min}
              onChange={(e) => setPriceInput({ ...priceInput, min: e.target.value })}
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent"
              min="0"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceInput.max}
              onChange={(e) => setPriceInput({ ...priceInput, max: e.target.value })}
              className="w-full text-sm bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-650 rounded-lg px-2.5 py-1.5 outline-none focus:border-accent"
              min="0"
            />
          </div>
          <button
            type="submit"
            className="w-full text-xs font-semibold py-2 bg-slate-100 dark:bg-slate-700 hover:bg-accent hover:text-white text-slate-700 dark:text-white rounded-lg transition-colors border border-slate-200 dark:border-slate-650"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Rating filter Section */}
      <div>
        <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-3">
          Customer Rating
        </h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(rating)}
              className={`w-full flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg transition-colors ${
                selectedRating === rating
                  ? 'bg-slate-100 dark:bg-slate-700 font-semibold text-accent'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs">& Up</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
