import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SidebarFilter } from '../components/SidebarFilter';
import { ProductCard } from '../components/ProductCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../utils/axios';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  
  // Sort, Page, and Limit States
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile Filter Drawer Toggler
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync state with URL params changes (e.g. from navbar searches)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setSearch(searchParams.get('search') || '');
    setRating(searchParams.get('rating') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Fetch catalog products from API
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        // Build query string
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (rating) params.append('rating', rating);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sort) params.append('sort', sort);
        params.append('page', page);
        params.append('limit', 9); // 9 products per page

        const res = await api.get(`/products?${params.toString()}`);
        if (res.data.success) {
          setProducts(res.data.products);
          setTotalPages(res.data.pages || 1);
          setTotalCount(res.data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [search, category, rating, minPrice, maxPrice, sort, page]);

  // Update URL Search Parameters
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    
    // Always reset page to 1 when filters change (unless updating page itself)
    if (!newParams.hasOwnProperty('page')) {
      updated.set('page', '1');
      setPage(1);
    }

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === '' || val === null || val === undefined) {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });

    setSearchParams(updated);
  };

  const handleCategorySelect = (catName) => {
    setCategory(catName);
    updateUrlParams({ category: catName });
  };

  const handlePriceSelect = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateUrlParams({ minPrice: min, maxPrice: max });
  };

  const handleRatingSelect = (rateVal) => {
    setRating(rateVal);
    updateUrlParams({ rating: rateVal });
  };

  const handleSortSelect = (sortVal) => {
    setSort(sortVal);
    updateUrlParams({ sort: sortVal });
  };

  const handlePageSelect = (pageVal) => {
    if (pageVal < 1 || pageVal > totalPages) return;
    setPage(pageVal);
    updateUrlParams({ page: pageVal.toString() });
    // Scroll window to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setCategory('');
    setSearch('');
    setRating('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    setSearchParams(new URLSearchParams()); // Wipes all search params
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Search status header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {search ? `Search Results for "${search}"` : category ? `${category} Collection` : 'All Products'}
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Showing {products.length} of {totalCount} matching results
          </p>
        </div>

        {/* Sorting and Mobile togglers */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold rounded-lg"
          >
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            Filters
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-450 dark:text-slate-400 font-medium whitespace-nowrap">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => handleSortSelect(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 dark:border-slate-700 text-xs font-semibold rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="popular">Customer Popularity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block lg:col-span-1">
          <SidebarFilter
            selectedCategory={category}
            onCategoryChange={handleCategorySelect}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceSelect}
            selectedRating={rating}
            onRatingChange={handleRatingSelect}
            onClearFilters={handleClearFilters}
          />
        </aside>

        {/* Mobile Filters Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileFilterOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 bg-white dark:bg-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-bold text-slate-900 dark:text-white">Filter Parameters</h3>
                  <button onClick={() => setMobileFilterOpen(false)} className="text-xs font-semibold text-slate-400">Close</button>
                </div>
                <SidebarFilter
                  selectedCategory={category}
                  onCategoryChange={(val) => {
                    handleCategorySelect(val);
                    setMobileFilterOpen(false);
                  }}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onPriceChange={(min, max) => {
                    handlePriceSelect(min, max);
                    setMobileFilterOpen(false);
                  }}
                  selectedRating={rating}
                  onRatingChange={(val) => {
                    handleRatingSelect(val);
                    setMobileFilterOpen(false);
                  }}
                  onClearFilters={() => {
                    handleClearFilters();
                    setMobileFilterOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Product Grid & List Area */}
        <main className="lg:col-span-3 space-y-8">
          
          {loading ? (
            <LoadingSkeleton type="card" count={6} />
          ) : products.length === 0 ? (
            <div className="py-24 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-xs flex flex-col items-center justify-center text-center px-6">
              <SlidersHorizontal className="w-16 h-16 text-slate-300 stroke-1 mb-4" />
              <h3 className="text-lg font-bold text-slate-750 dark:text-white">No Products Found</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-sm">
                Try widening your price range, clearing filter tags, or modifying your search keywords.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-dark text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageSelect(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Pages list */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageSelect(pageNum)}
                        className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all border ${
                          page === pageNum
                            ? 'bg-accent border-accent text-white shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => handlePageSelect(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 dark:hover:bg-slate-700 disabled:opacity-40 rounded-xl transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </main>

      </div>
    </div>
  );
}
