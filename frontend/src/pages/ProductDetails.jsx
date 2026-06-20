import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, CreditCard, ChevronRight, Plus, Minus, Send, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { RelatedProducts } from '../components/RelatedProducts';
import { toast } from 'react-toastify';
import api from '../utils/axios';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch product detail on mount/param change
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
          setActiveImage(res.data.product.images?.[0] || '/uploads/placeholder.jpg');
          setQuantity(1); // Reset quantity
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleQtyChange = (val) => {
    if (val < 1 || val > product.stock) return;
    setQuantity(val);
  };

  const handleAddToCart = async () => {
    if (product.stock === 0) return;
    const res = await addToCart(product, quantity);
    if (res?.success) {
      toast.success(`${quantity} ${product.name} added to cart!`);
    } else {
      toast.error(res?.message || 'Failed to add item to cart.');
    }
  };

  const handleBuyNow = async () => {
    if (product.stock === 0) return;
    const res = await addToCart(product, quantity);
    if (res?.success) {
      navigate('/checkout');
    } else {
      toast.error(res?.message || 'Failed to initialize checkout.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Please enter a comment for your review.');
      return;
    }

    try {
      setReviewLoading(true);
      const res = await api.post(`/products/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        toast.success('Thank you! Your review was recorded.');
        setComment('');
        setRating(5);
        
        // Reload details to fetch updated review list and rating averages
        const refreshRes = await api.get(`/products/${id}`);
        if (refreshRes.data.success) {
          setProduct(refreshRes.data.product);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="details" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center font-sans">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Product Not Found</h3>
        <button
          onClick={() => navigate('/products')}
          className="mt-6 px-6 py-2 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans space-y-12">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 capitalize">
        <span className="cursor-pointer hover:text-accent" onClick={() => navigate('/')}>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-accent" onClick={() => navigate('/products')}>Shop</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="cursor-pointer hover:text-accent" onClick={() => navigate(`/products?category=${product.category?.name}`)}>
          {product.category?.name}
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-200 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Primary Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-700/50 relative shadow-sm">
            <img
              src={activeImage}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/uploads/placeholder.jpg';
              }}
            />
          </div>
          {/* Thumbnails row */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border bg-white dark:bg-slate-800 relative transition-all ${
                    activeImage === imgUrl ? 'border-accent ring-2 ring-accent/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  <img src={imgUrl} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e) => {e.target.src = '/uploads/placeholder.jpg';}} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info Fields */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category tag */}
            <span className="px-3 py-1 bg-accent/10 text-accent font-bold text-xs uppercase tracking-wider rounded-lg">
              {product.category?.name}
            </span>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Star Rating details */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating || 0) ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                {product.rating ? product.rating.toFixed(1) : 'No Ratings'}
              </span>
              <span className="text-slate-300 dark:text-slate-650">•</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {product.numReviews} Verified Reviews
              </span>
            </div>

            {/* Price tag */}
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ${(product.price || 0).toFixed(2)}
            </div>

            {/* Stock indicator badge */}
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                  <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} items left)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                Product Details
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Action box */}
          {product.stock > 0 && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              
              {/* Qty count selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <button
                    onClick={() => handleQtyChange(quantity - 1)}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold text-sm text-slate-800 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange(quantity + 1)}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Buy It Now
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Review Feed & Form Section */}
      <section className="pt-10 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Col: Write Review */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Customer Reviews</h3>
            <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
              Share your shopping experience with other buyers
            </p>
          </div>

          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Write a Review</h4>
              
              {/* Rating selection */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Rating</label>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform active:scale-125"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs text-slate-400 dark:text-slate-500 font-bold mb-1.5 uppercase">Your Review</label>
                <textarea
                  rows="3"
                  placeholder="How did this product perform? Share feedback on comfort, design, speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full py-2.5 bg-accent hover:bg-accent-dark disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {reviewLoading ? 'Saving Review...' : 'Submit Review'}
              </button>

            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center space-y-3">
              <p className="text-xs text-slate-450 dark:text-slate-400">Please sign in to write a review for this product.</p>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold rounded-lg transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

        {/* Right Col: Feed List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Recent Critiques ({product.reviews?.length || 0})</h3>
          
          {(!product.reviews || product.reviews.length === 0) ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic py-6">No reviews have been written for this product yet.</p>
          ) : (
            <div className="space-y-4">
              {product.reviews.map((rev) => (
                <div key={rev._id} className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    {/* User profile */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs uppercase text-slate-550 dark:text-slate-200">
                        {rev.user?.name ? rev.user.name.charAt(0) : rev.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rev.user?.name || rev.name}</h5>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    {/* Stars */}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rev.rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* Related Products Section */}
      <RelatedProducts currentProductId={product._id} categoryId={product.category?._id} />

    </div>
  );
}
