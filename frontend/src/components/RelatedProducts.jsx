import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { ProductCard } from './ProductCard';

export const RelatedProducts = ({ currentProductId, categoryId }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!categoryId) return;
      try {
        setLoading(true);
        // Fetch up to 5 products of same category
        const res = await api.get(`/products?category=${categoryId}&limit=5`);
        if (res.data.success) {
          // Filter out the active product being viewed
          const filtered = res.data.products.filter(
            (p) => p._id !== currentProductId
          );
          setRelated(filtered.slice(0, 4)); // Show top 4
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="py-8 border-t border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Related Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="py-12 border-t border-slate-100 dark:border-slate-700/60 font-sans">
      <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white">
        Related Products You May Like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {related.map((prod) => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </div>
  );
};
