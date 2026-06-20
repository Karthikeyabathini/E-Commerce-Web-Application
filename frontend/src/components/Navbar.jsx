import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, User as UserIcon, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/axios';

export const Navbar = ({ onCartToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const suggestionRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch categories for search bar dropdown
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories in navbar:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch search suggestions as query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await api.get(`/products?search=${searchQuery}&limit=5`);
        if (res.data.success) {
          setSuggestions(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    let path = `/products?search=${encodeURIComponent(searchQuery)}`;
    if (selectedCategory) {
      path += `&category=${encodeURIComponent(selectedCategory)}`;
    }
    navigate(path);
  };

  const handleSuggestionClick = (prodId) => {
    setSearchQuery('');
    setShowSuggestions(false);
    navigate(`/products/${prodId}`);
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-900 text-white shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 text-xl font-bold tracking-tight text-white">
            <span className="text-accent mr-1">Shop</span>Sphere
          </Link>

          {/* Search Bar - Center */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-2xl relative items-center bg-white dark:bg-slate-800 text-slate-800 rounded-lg overflow-visible"
          >
            {/* Category Dropdown */}
            <div className="relative border-r border-slate-200 dark:border-slate-700">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2 text-xs font-medium rounded-l-lg outline-none cursor-pointer pr-8 appearance-none h-10 border-0"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3.5 pointer-events-none text-slate-400" />
            </div>

            {/* Input field */}
            <input
              type="text"
              placeholder="Search for electronics, fashion, decor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-4 py-2 text-sm text-slate-900 dark:text-white bg-transparent outline-none border-0 h-10 w-full"
            />

            {/* Search Icon Submit Button */}
            <button 
              type="submit" 
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-r-lg h-10 transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Search Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionRef}
                className="absolute top-11 left-0 right-0 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700/50 py-2 z-50 text-slate-900 dark:text-slate-100"
              >
                {suggestions.map((prod) => (
                  <div
                    key={prod._id}
                    onClick={() => handleSuggestionClick(prod._id)}
                    className="px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer flex items-center gap-3"
                  >
                    <img 
                      src={prod.images?.[0]} 
                      alt={prod.name} 
                      className="w-8 h-8 object-cover rounded bg-slate-50 dark:bg-slate-900"
                      onError={(e) => { e.target.src = '/uploads/placeholder.jpg'; }}
                    />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">{prod.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{prod.category?.name}</p>
                    </div>
                    <span className="text-xs font-bold text-accent">${prod.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Right Action Menu Icons */}
          <div className="hidden md:flex items-center gap-6">
            {/* Dark Mode Switcher */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              {user ? (
                <>
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-1 hover:text-accent transition-colors py-2 text-sm font-medium focus:outline-none"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Hi, {user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl py-1.5 border border-slate-100 dark:border-slate-700 z-50 text-slate-800 dark:text-slate-200">
                      <Link 
                        to="/dashboard" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        My Dashboard
                      </Link>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr className="border-slate-100 dark:border-slate-700 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="flex items-center gap-1 hover:text-accent transition-colors text-sm font-medium">
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Shopping Cart Drawer Trigger */}
            <button 
              onClick={onCartToggle}
              className="relative p-2 hover:text-accent transition-colors flex items-center gap-1 text-slate-300 hover:text-white"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
              <span className="text-sm font-semibold hidden lg:inline">Cart</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-3">
            <button onClick={toggleTheme} className="p-1.5 text-slate-300">
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={onCartToggle}
              className="relative p-1.5 text-slate-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="flex bg-white dark:bg-slate-700 rounded-lg text-slate-800 overflow-hidden">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm text-slate-900 dark:text-white bg-transparent outline-none border-0"
            />
            <button type="submit" className="px-3 bg-accent text-white flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Links list */}
          <div className="flex flex-col space-y-2">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white"
            >
              Home
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm text-slate-300 hover:text-white"
            >
              Shop All Products
            </Link>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm text-slate-300 hover:text-white"
                >
                  My Dashboard
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-emerald-400 hover:text-white"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm text-accent font-semibold"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
