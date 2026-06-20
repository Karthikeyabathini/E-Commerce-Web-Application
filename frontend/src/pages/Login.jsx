import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect target
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const res = await login(data.email, data.password);
      if (res.success) {
        toast.success('Successfully logged in! Welcome back.');
        // If user is admin, default to admin panel if no specific referrer
        if (from === '/' && localStorage.getItem('token')) {
          // Read token or wait. The simplest way is to check the user role or just go to referrer
          // We can let the context process and navigate
          setTimeout(() => {
            navigate(from);
          }, 100);
        } else {
          navigate(from);
        }
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('An unexpected login error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-slate-900 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/50 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <LogIn className="w-6 h-6 text-accent" />
            Welcome Back
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Sign in to access your dashboard, orders, and cart items
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent ${
                errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-650'
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please provide a valid email address',
                },
              })}
            />
            {errors.email && (
              <span className="text-[10px] font-semibold text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full bg-slate-50 dark:bg-slate-700 border rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-accent ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-slate-200 dark:border-slate-650'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[10px] font-semibold text-red-500 mt-1 block">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-6"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700/50 pt-4">
          New to ShopSphere?{' '}
          <Link to="/register" className="text-accent font-semibold hover:underline">
            Create an account
          </Link>
        </div>

      </div>
    </div>
  );
}
