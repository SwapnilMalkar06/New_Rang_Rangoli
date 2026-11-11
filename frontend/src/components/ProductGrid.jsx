import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  fetchProducts,
  setFilter,
  resetFilters,
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
  selectProductsPagination,
  selectActiveFilters
} from '../store/productSlice';
import ProductCard from './ProductCard';
import RangoliColorCatalog from './RangoliColorCatalog';
import SanskarBharatiColorCatalog from './SanskarBharatiColorCatalog';
import { useLanguage } from '../context/LanguageContext';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { addToCart } from '../store/cartSlice';

// Available theme definitions for cultural calendar simulation
const THEMES = {
  default: {
    id: 'default',
    name: 'Hardware & Arts (Default)',
    accent: 'teal',
    bgClass: 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100',
    bannerClass: 'from-slate-800 to-emerald-950 text-white border-emerald-500/20',
    bannerTitle: 'Rangoli & Painting Specialists',
    bannerSubtitle: 'Premium colors, industrial wall paints, and professional tools for year-round quality.',
    accentColorText: 'text-emerald-500',
    accentColorBg: 'bg-emerald-500'
  },
  ganeshChaturthi: {
    id: 'ganeshChaturthi',
    name: 'Ganesh Chaturthi Special',
    accent: 'orange',
    bgClass: 'bg-amber-50/40 dark:bg-amber-950/20 text-slate-950 dark:text-amber-50',
    bannerClass: 'from-amber-600 via-orange-600 to-red-800 text-white border-amber-500/30',
    bannerTitle: 'Ganesh Festival Hub 🌸',
    bannerSubtitle: 'Celebrate with eco-friendly vibrant rangoli powders, stencils, and traditional home decorations.',
    accentColorText: 'text-orange-500',
    accentColorBg: 'bg-orange-500'
  },
  diwali: {
    id: 'diwali',
    name: 'Diwali Lights Festival',
    accent: 'indigo',
    bgClass: 'bg-indigo-950/10 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100',
    bannerClass: 'from-indigo-900 via-purple-900 to-pink-900 text-white border-indigo-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    bannerTitle: 'Diwali Festival of Lights ✨',
    bannerSubtitle: 'Stunning metallic powders, stencils, deeps, and glowing lights to light up your celebrations.',
    accentColorText: 'text-purple-500',
    accentColorBg: 'bg-purple-500'
  },
  wedding: {
    id: 'wedding',
    name: 'Grand Wedding Season',
    accent: 'crimson',
    bgClass: 'bg-rose-50/30 dark:bg-rose-950/10 text-slate-900 dark:text-rose-50',
    bannerClass: 'from-red-800 via-rose-700 to-amber-700 text-white border-red-500/30',
    bannerTitle: 'Auspicious Wedding Hub 💍',
    bannerSubtitle: 'Exquisite custom blends, decor accents, and high-end colors for beautiful ceremonies.',
    accentColorText: 'text-rose-600',
    accentColorBg: 'bg-rose-600'
  }
};

const TABS = [
  { key: 'Rangoli', labelKey: 'catRangoli', emoji: '🌸' },
  { key: 'Sanskar Bharati Rangoli', labelKey: 'catSanskarBharati', emoji: '🌀' },
  { key: 'Portrait Color', labelKey: 'catPortraitColor', emoji: '🎨' },
  { key: 'Fluorescent Color', labelKey: 'catFluorescentColor', emoji: '⚡' },
  { key: 'Tools', labelKey: 'catTools', emoji: '🔧' },
  { key: 'Holi Color', labelKey: 'catHoliColor', emoji: '🌈' },
  { key: 'Gulal', labelKey: 'catGulal', emoji: '💖' },
];

const ProductGrid = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);
  
  // Select slice states
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const pagination = useSelector(selectProductsPagination);
  const filters = useSelector(selectActiveFilters);

  // Search parameters for syncing Navbar category clicks
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategoryParam = searchParams.get('category');
  const tagParam = searchParams.get('tag') || '';
  const searchParam = searchParams.get('search') || '';
  const themeParam = searchParams.get('theme') || '';

  // Determine category: if tag is Holi or search refers to holi / dhulivandan and no category is specified, default to 'Holi Color' instead of 'Rangoli'
  const isHoli = (tagParam && tagParam.toLowerCase() === 'holi') ||
                 (searchParam && (searchParam.toLowerCase().includes('holi') || searchParam.toLowerCase().includes('dhulivandan')));
  const categoryParam = rawCategoryParam || (isHoli ? 'Holi Color' : 'Rangoli');

  // Local state for dynamic theme engine toggle
  const [activeTheme, setActiveTheme] = useState('default');
  const theme = THEMES[activeTheme] || THEMES.default;

  // Local inputs to hold values during text edits before trigger
  const [searchInput, setSearchInput] = useState(filters.search);
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice);

  // Sync theme based on query params or active festival
  useEffect(() => {
    if (themeParam && THEMES[themeParam]) {
      setActiveTheme(themeParam);
    } else if (tagParam === 'Ganpati' || (searchParam && searchParam.toLowerCase().includes('gan'))) {
      setActiveTheme('ganeshChaturthi');
    } else if (tagParam === 'Diwali' || (searchParam && searchParam.toLowerCase().includes('diw'))) {
      setActiveTheme('diwali');
    }
  }, [themeParam, tagParam, searchParam]);

  // Sync URL search parameters to Redux filter state
  useEffect(() => {
    const updates = {};
    let changed = false;

    if (categoryParam !== filters.mainCategory) {
      updates.mainCategory = categoryParam;
      changed = true;
    }
    if (tagParam !== (filters.tag || '')) {
      updates.tag = tagParam;
      changed = true;
    }
    if (searchParam !== (filters.search || '')) {
      updates.search = searchParam;
      setSearchInput(searchParam);
      changed = true;
    }

    if (changed) {
      dispatch(setFilter({ ...updates, page: 1 }));
    }
  }, [categoryParam, tagParam, searchParam, dispatch, filters.mainCategory, filters.tag, filters.search]);

  // Trigger dispatch on filter changes
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Sync inputs with global state resets
  useEffect(() => {
    setSearchInput(filters.search);
    setMinPriceInput(filters.minPrice);
    setMaxPriceInput(filters.maxPrice);
  }, [filters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilter({ search: searchInput }));
  };

  const handlePriceApply = () => {
    dispatch(setFilter({
      minPrice: minPriceInput,
      maxPrice: maxPriceInput
    }));
  };

  const handleCategorySelect = (categoryName) => {
    const selected = categoryName || 'Rangoli';
    setSearchParams({ category: selected });
    dispatch(setFilter({ 
      mainCategory: selected,
      subCategory: '', // reset subCategory on main change
      tag: '',
      page: 1
    }));
  };

  const handleCategoryChange = (e) => {
    handleCategorySelect(e.target.value);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      dispatch(setFilter({ page: newPage }));
    }
  };

  const handleReset = () => {
    setSearchParams({ category: 'Rangoli' });
    setSearchInput('');
    dispatch(resetFilters());
    dispatch(setFilter({ mainCategory: 'Rangoli' }));
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login?redirect=/shop');
      return;
    }
    const qty = isWholesaler ? product.minWholesaleQuantity : 1;
    dispatch(addToCart({ product, quantity: qty }));
  };

  const getTranslatedBanner = () => {
    if (language === 'mr') {
      switch(activeTheme) {
        case 'ganeshChaturthi':
          return {
            title: 'गणेशोत्सव विशेष हब 🌸',
            subtitle: 'पर्यावरणपूरक रांगोळी पावडर, नक्षीकाम आणि पारंपारिक गृह सजावटीसह उत्सव साजरा करा.'
          };
        case 'diwali':
          return {
            title: 'तेजोमय दिवाळी प्रकाश उत्सव ✨',
            subtitle: 'उत्सवाची शोभा वाढवण्यासाठी धातूची रांगोळी पावडर, दिवे आणि आकर्षक आकाशदिवे.'
          };
        case 'wedding':
          return {
            title: 'भव्य विवाह सोहळा 💍',
            subtitle: 'सुंदर समारंभांसाठी उत्कृष्ट सानुकूल रंग मिश्रण आणि सजावट साहित्य.'
          };
        default:
          return {
            title: 'रांगोळी आणि पेंटिंग तज्ञ',
            subtitle: 'उत्कृष्ट रंग, औद्योगिक पेंट आणि वर्षभर गुणवत्ता देणारी व्यावसायिक साधने.'
          };
      }
    }
    return {
      title: theme.bannerTitle,
      subtitle: theme.bannerSubtitle
    };
  };

  const bannerText = getTranslatedBanner();

  return (
    <div className={`min-h-screen px-4 py-8 md:px-8 transition-colors duration-500 ${theme.bgClass}`}>
      <div className="mx-auto max-w-7xl">
        
        {/* Dynamic Theme Banner */}
        <div className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 md:p-12 mb-8 shadow-xl transition-all duration-500 ${theme.bannerClass}`}>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl mb-4 transition-all duration-300">
              {bannerText.title}
            </h1>
            <p className="text-sm md:text-base text-slate-100/90 leading-relaxed mb-6 font-medium">
              {bannerText.subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleCategorySelect('Rangoli')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-lg hover:scale-103 transition-all cursor-pointer"
              >
                <span>🎨 {language === 'mr' ? '२३ रांगोळी शेड कार्ड (२५०g, ५००g, १kg)' : '23 Colors Shade Card (250g, 500g, 1kg)'}</span>
                <span>→</span>
              </button>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
                🚚 Free Local Shipping on ₹999+
              </span>
              <span className="rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wider">
                ⭐ 4.9/5 Star Local Review
              </span>
            </div>
          </div>
          {/* Subtle glowing abstract shape */}
          <div className="absolute right-0 bottom-0 h-64 w-64 translate-x-12 translate-y-12 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        {/* Search & Main Area Wrapper */}
        <div className="w-full mb-8">
          <div className="w-full space-y-6">
            
            {/* Horizontal Scrollable Categories Slider */}
            <div className="w-full overflow-x-auto pb-1 scrollbar-none select-none">
              <div className="flex gap-2.5 min-w-max px-1">
                {TABS.map((tab) => {
                  const isActive = filters.mainCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => handleCategorySelect(tab.key)}
                      className={`flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-bold transition-all duration-300 hover:scale-102 cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-950 dark:border-white'
                          : 'bg-white/60 text-slate-600 border-slate-200/80 hover:bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:text-slate-400 dark:border-slate-800/80 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-sm">{tab.emoji}</span>
                      <span>{t(tab.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Bar & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/70 px-5 py-3.5 pr-12 text-sm shadow-md outline-hidden backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/60 dark:text-white"
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-4 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </form>
            </div>

            {/* Active Filter Chips */}
            {(filters.tag || filters.search || filters.mainCategory) && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500">Active Filters:</span>
                {filters.tag && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 px-3 py-1 text-xs font-bold shadow-xs">
                    <span>Festival: {filters.tag}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams(prev => {
                          const next = new URLSearchParams(prev);
                          next.delete('tag');
                          return next;
                        });
                        dispatch(setFilter({ tag: '' }));
                      }}
                      className="ml-1 hover:text-red-500 text-sm font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.search && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 px-3 py-1 text-xs font-bold shadow-xs">
                    <span>Search: "{filters.search}"</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchParams(prev => {
                          const next = new URLSearchParams(prev);
                          next.delete('search');
                          return next;
                        });
                        setSearchInput('');
                        dispatch(setFilter({ search: '' }));
                      }}
                      className="ml-1 hover:text-red-500 text-sm font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                {filters.mainCategory && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs font-bold shadow-xs">
                    <span>Category: {filters.mainCategory}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('')}
                      className="ml-1 hover:text-red-500 text-sm font-extrabold cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline ml-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}



            {/* Error Message */}
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-3 h-10 w-10 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="mb-1 font-bold text-base">Retrieval Issue occurred</h3>
                <p className="mb-4 text-sm">{error}</p>
                <button
                  onClick={() => dispatch(fetchProducts(filters))}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
                >
                  Retry Request
                </button>
              </div>
            )}

            {/* Loading Grid Skeleton */}
            {loading && filters.mainCategory !== 'Rangoli' && filters.mainCategory !== 'Sanskar Bharati Rangoli' && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/40 p-4 animate-pulse">
                    <div className="aspect-square w-full rounded-xl bg-slate-200 dark:bg-slate-800 mb-4"></div>
                    <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md mb-2"></div>
                    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md mb-3"></div>
                    <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-md mb-1"></div>
                    <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md mb-4"></div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                      <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-md"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 23 Authentic Rangoli Color Shades Catalog (Under Shop Catalog -> Rangoli Tab) */}
            {filters.mainCategory === 'Rangoli' && (
              <div className="mb-8">
                <RangoliColorCatalog isEmbedded={true} externalSearch={searchInput} />
              </div>
            )}

            {/* Authentic Sanskar Bharati Rangoli Color Powders Catalog (Under Shop Catalog -> Sanskar Bharati Rangoli Tab) */}
            {filters.mainCategory === 'Sanskar Bharati Rangoli' && (
              <div className="mb-8">
                <SanskarBharatiColorCatalog isEmbedded={true} externalSearch={searchInput} />
              </div>
            )}

            {/* Actual Products Grid (Hidden on Rangoli and Sanskar Bharati Rangoli tabs, which use dedicated color shade catalogs) */}
            {!loading && !error && products.length > 0 && filters.mainCategory !== 'Rangoli' && filters.mainCategory !== 'Sanskar Bharati Rangoli' && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id || product.id}
                    product={product}
                    themeAccent={theme.accent}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}

            {/* Empty State (Hidden on Rangoli and Sanskar Bharati tabs since color catalogs are rendered above) */}
            {!loading && !error && products.length === 0 && filters.mainCategory !== 'Rangoli' && filters.mainCategory !== 'Sanskar Bharati Rangoli' && (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-4 h-12 w-12 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-200">
                  {t('emptyCatalogTitle')}
                </h3>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                  {t('emptyCatalogDesc')}
                </p>
                <button
                  onClick={handleReset}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md ${theme.accentColorBg}`}
                >
                  {t('clearFiltersBtn')}
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && filters.mainCategory !== 'Rangoli' && filters.mainCategory !== 'Sanskar Bharati Rangoli' && (
              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800 pt-6">
                <span className="text-xs font-semibold text-slate-500">
                  Showing {products.length} of {pagination.totalProducts} products
                </span>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    ◀ Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition-colors duration-200 ${
                            pagination.currentPage === pageNum
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                              : 'bg-white/80 text-slate-700 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Next ▶
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductGrid;
