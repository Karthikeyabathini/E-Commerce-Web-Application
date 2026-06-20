import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to our newsletter! Check your inbox for dynamic promo offers.');
    setEmail('');
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16 px-4 md:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Info */}
        <div className="space-y-4">
          <h3 className="text-white text-lg font-bold">
            <span className="text-accent">Shop</span>Sphere
          </h3>
          <p className="text-sm leading-relaxed text-slate-400">
            A premium full-stack shopping destination. Discover curated electronics, fashion apparel, smart-home decors, and outdoor fitness gear.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800 hover:bg-accent hover:text-white rounded-full transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-accent hover:text-white rounded-full transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-slate-800 hover:bg-accent hover:text-white rounded-full transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Categories Link Columns */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop Categories</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="/products?category=Electronics" className="hover:text-white hover:underline transition-all">Electronics & Gadgets</a>
            </li>
            <li>
              <a href="/products?category=Fashion" className="hover:text-white hover:underline transition-all">Fashion & Apparel</a>
            </li>
            <li>
              <a href="/products?category=Home%20%26%20Living" className="hover:text-white hover:underline transition-all">Smart Home & Decor</a>
            </li>
            <li>
              <a href="/products?category=Fitness%20%26%20Outdoors" className="hover:text-white hover:underline transition-all">Fitness & Outdoors</a>
            </li>
          </ul>
        </div>

        {/* Customer Support Columns */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="#" className="hover:text-white transition-all">Track Your Order</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-all">Shipping & Deliveries</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-all">Easy Returns & Exchanges</a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition-all">FAQs & Terms</a>
            </li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Stay Updated</h4>
          <p className="text-sm text-slate-400">
            Subscribe to receive exclusive deals, early access to new releases, and weekly discounts.
          </p>
          <form onSubmit={handleSubscribe} className="flex relative">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2.5 text-sm outline-none border border-slate-700 focus:border-accent"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3.5 bg-accent hover:bg-accent-dark text-white rounded-md transition-colors flex items-center justify-center"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© {new Date().getFullYear()} ShopSphere. All rights reserved. Designed for excellence.</p>
        <div className="flex gap-4">
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Visa</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Mastercard</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Apple Pay</span>
          <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">COD</span>
        </div>
      </div>
    </footer>
  );
};
