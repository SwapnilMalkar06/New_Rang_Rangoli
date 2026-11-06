import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { addToCart } from '../store/cartSlice';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { ArrowLeft, Plus, Minus, Info, AlertCircle, ShoppingCart, Lock } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to retrieve product details');
        }
        
        setProduct(data.data);
        setQuantity(isWholesaler ? data.data.minWholesaleQuantity : 1);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, isWholesaler]);

  const handleIncrement = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    const minQty = isWholesaler ? product.minWholesaleQuantity : 1;
    if (quantity > minQty) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    dispatch(addToCart({ product, quantity }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Failed to load product details</h2>
        <p className="text-slate-500 mb-6">{error || 'Product not found'}</p>
        <Link to="/shop" className="rounded-xl bg-orange-500 text-white px-5 py-2.5 text-xs font-bold shadow-md">
          Back to Shop
        </Link>
      </div>
    );
  }

  const displayName = language === 'mr' && product.nameMR ? product.nameMR : product.name;
  const displayDescription = language === 'mr' && product.descriptionMR ? product.descriptionMR : product.description;
  const mainImage = product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400';

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        {/* Back Link */}
        <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left: Product Image */}
          <div className="rounded-3xl border border-white/20 bg-white/50 dark:border-slate-800/40 dark:bg-slate-900/40 p-4 shadow-lg backdrop-blur-md overflow-hidden aspect-square flex items-center justify-center">
            <img
              src={mainImage}
              alt={displayName}
              className="rounded-2xl max-h-full max-w-full object-cover shadow-md hover:scale-101 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400';
              }}
            />
          </div>

          {/* Right: Info Panels */}
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                {product.mainCategory}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3 mb-2 font-outfit text-slate-900 dark:text-white">
                {displayName}
              </h1>
              <span className="text-xs font-bold text-slate-400 block mb-4 uppercase tracking-wider">
                Category Pillar: {product.subCategory}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                ★★★★★ <span className="text-slate-400 dark:text-slate-500 ml-1">4.8 / 5 Customer Rating</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-slate-800/40 p-6 backdrop-blur-md">
              {isWholesaler ? (
                <div>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider block mb-1">
                    {t('wholesalePriceLabel')}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      ₹{product.wholesalePrice.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      Retail: ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 mt-3 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500 border border-indigo-500/20">
                    <Info className="h-3.5 w-3.5" />
                    Minimum Order Quantity (MOQ): {product.minWholesaleQuantity} units
                  </span>
                </div>
              ) : product.isDiscountActive ? (
                <div>
                  <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block mb-1">
                    Festive Discount Active!
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                      ₹{product.currentPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                    {t('retailPriceLabel')}
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    ₹{product.price.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Product Description
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {displayDescription}
              </p>
            </div>

            {/* Inventory Status & MOQ controls */}
            <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Quantity
                </span>
                <span className="text-xs font-bold">
                  {product.stockQuantity > 0 ? (
                    <span className="text-emerald-500">In Stock ({product.stockQuantity} available)</span>
                  ) : (
                    <span className="text-red-500">Out of Stock</span>
                  )}
                </span>
              </div>

              {/* Quantity Picker & Add to Cart */}
              {product.stockQuantity > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex items-center border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= (isWholesaler ? product.minWholesaleQuantity : 1)}
                      className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-2 text-sm font-bold w-16 text-center select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stockQuantity}
                      className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCartClick}
                    className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl text-white font-bold py-3.5 px-6 text-xs transition-all duration-300 cursor-pointer ${
                      !user
                        ? 'bg-slate-900 hover:bg-orange-600 dark:bg-slate-800 dark:hover:bg-orange-600 shadow-slate-900/20'
                        : 'bg-gradient-to-r from-orange-500 to-rose-600 hover:shadow-lg shadow-orange-500/10 hover:scale-102'
                    }`}
                  >
                    {!user ? (
                      <>
                        <Lock className="h-4 w-4 text-amber-400" />
                        <span>{language === 'mr' ? 'खरेदीसाठी लॉगिन करा 🔒' : 'Sign In to Add to Cart 🔒'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{t('addToCartBtn')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Wholesaler safety warn */}
              {isWholesaler && quantity < product.minWholesaleQuantity && (
                <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-xs text-red-500 font-medium">
                  Wholesalers must purchase at least {product.minWholesaleQuantity} units of this item.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
