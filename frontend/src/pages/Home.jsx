import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import api from '../utils/axios';

export default function Home() {
  const navigate = useNavigate();
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoading(true);
        // Fetch top 4 newest products
        const res = await api.get('/products?sort=newest&limit=4');
        if (res.data.success) {
          setLatestProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching latest products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80',
      description: 'Advanced gear, premium audios, and smart accessories.',
      path: '/products?category=Electronics'
    },
    {
      name: 'Fashion',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
      description: 'Elegant threads, footwear, and style extensions.',
      path: '/products?category=Fashion'
    },
    {
      name: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80',
      description: 'Modern craft decors, lighting, and organization.',
      path: '/products?category=Home%20%26%20Living'
    },
    {
      name: 'Fitness & Outdoors',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      description: 'Workout assets, bottles, and training apparatus.',
      path: '/products?category=Fitness%20%26%20Outdoors'
    }
  ];

  return (
    <div className="space-y-16 pb-20 font-sans">
      
      {/* Hero Section */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 px-6 md:px-12 flex flex-col justify-center items-center min-h-[500px]">
        {/* Background Decorative Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b,transparent_60%)]" />
        <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80')" }} />

        <div className="relative z-10 max-w-4xl text-center space-y-6 animate-slide-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/20 border border-accent/35 rounded-full text-xs font-bold uppercase tracking-wider text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            Mid-Season Megasale Active
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate Your Everyday <br />
            With <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">ShopSphere</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover a curated universe of top-tier electronics, fashion apparel, handcrafted home decor, and professional fitness gear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/products"
              className="px-8 py-3.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Shop Catalog Now
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#categories"
              className="px-8 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl font-semibold backdrop-blur-xs border border-slate-700 transition-all text-center"
            >
              Browse Categories
            </a>
          </div>
        </div>
      </section>

      {/* Services Value Proposition */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 flex items-center justify-center h-12 w-12">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Free Logistics</h4>
            <p className="text-xs text-slate-400 mt-1">Free standard delivery on orders above $1000</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 flex items-center justify-center h-12 w-12">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Secure Payments</h4>
            <p className="text-xs text-slate-400 mt-1">SSL certified billing security protections</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 flex items-center justify-center h-12 w-12">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Easy Returns</h4>
            <p className="text-xs text-slate-400 mt-1">30 days return window, no questions asked</p>
          </div>
        </div>
        <div className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-xs">
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500 flex items-center justify-center h-12 w-12">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Premium Quality</h4>
            <p className="text-xs text-slate-400 mt-1">Handpicked curated products from certified brands</p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs uppercase font-bold text-accent tracking-wider">Explore Collections</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Shop by Category</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat, i) => (
            <div 
              key={i}
              onClick={() => navigate(cat.path)}
              className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/50 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative pt-[60%] overflow-hidden bg-slate-100 dark:bg-slate-900">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-accent mt-4 group-hover:gap-1.5 transition-all">
                  Browse items <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-xs uppercase font-bold text-accent tracking-wider">Fresh In Stock</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Latest Arrivals</h2>
          </div>
          <Link to="/products" className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSkeleton type="card" count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotion banner callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-lg">
          <div className="space-y-3 text-center md:text-left">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Exclusive Offer</span>
            <h3 className="text-2xl md:text-4xl font-extrabold">Upgrade Your Gaming Sanctuary</h3>
            <p className="text-sm text-amber-50 max-w-xl">
              Get an extra 15% off on custom mechanical keyboards and noise-cancelling headphones this week only. Use promo code <span className="font-bold text-white bg-slate-950/20 px-2 py-0.5 rounded">PLAY15</span>.
            </p>
          </div>
          <Link
            to="/products?category=Electronics"
            className="px-8 py-3.5 bg-white text-orange-650 hover:bg-slate-50 rounded-xl font-bold shadow-md transition-colors whitespace-nowrap text-orange-600"
          >
            Claim Discount
          </Link>
        </div>
      </section>

    </div>
  );
}
