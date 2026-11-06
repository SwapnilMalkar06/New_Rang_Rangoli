import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { fetchProducts, selectAllProducts, selectProductsLoading } from '../store/productSlice';
import { addToCart } from '../store/cartSlice';
import { selectIsWholesaler } from '../store/authSlice';
import ProductCard from '../components/ProductCard';
import FestivalCards from '../components/FestivalCards';
import CurrentFestivalHero from '../components/CurrentFestivalHero';
import { Truck, CheckCircle, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  const { t, language } = useLanguage();
  const dispatch = useDispatch();
  const isWholesaler = useSelector(selectIsWholesaler);
  const products = useSelector(selectAllProducts);
  const loading = useSelector(selectProductsLoading);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 3 }));
  }, [dispatch]);

  const handleAddToCart = (product) => {
    const qty = isWholesaler ? product.minWholesaleQuantity : 1;
    dispatch(addToCart({ product, quantity: qty }));
    alert(
      language === 'mr'
        ? `कार्टमध्ये यशस्वीरित्या जोडले गेले: ${language === 'mr' && product.nameMR ? product.nameMR : product.name}`
        : `Added to cart successfully: ${product.name}`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 bg-mesh-glow">
      {/* Real-time Full-Area Festival Hero (Displays only the current festival in real-time) */}
      <CurrentFestivalHero />

      {/* Trust Badges */}
      <section className="py-8 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <Truck className="h-8 w-8 text-orange-500 mb-2" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {t('trustBadgeShipping')}
              </h3>
            </div>
            <div className="flex flex-col items-center p-4">
              <ShieldCheck className="h-8 w-8 text-rose-500 mb-2" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {t('trustBadgeSupport')}
              </h3>
            </div>
            <div className="flex flex-col items-center p-4">
              <CheckCircle className="h-8 w-8 text-indigo-500 mb-2" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Direct Wholesale Rates
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Festival Showcase Cards */}
      <FestivalCards />

      {/* Featured Products */}
      <section className="py-16 bg-white/30 dark:bg-slate-950/20 border-t border-b border-slate-200/40 dark:border-slate-800/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                {t('trendingProducts')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hand-picked high-quality products for retail purchase or wholesale bulk orders.
              </p>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 self-start sm:self-auto"
            >
              View Full Catalog →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse h-80 bg-white/20"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  themeAccent={isWholesaler ? 'indigo' : 'orange'}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('testimonialsTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-6 shadow backdrop-blur-md">
              <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                "The eco-friendly Rangoli colors from New Rang Rangoli are simply amazing. They are extremely bright and washed off clean from the tiles. Will definitely buy in bulk again for the Diwali festival."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500">
                  AP
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Anjali Patwardhan</h4>
                  <span className="text-[10px] text-slate-400">Pune Customer</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-6 shadow backdrop-blur-md">
              <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                "I run a painting store in Satara. Ordering wholesale exterior acrylics and stencil packs from this portal has saved me 40% on sourcing fees. The verification process was quick and easy!"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-500">
                  RK
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Rajendra Kulkarni</h4>
                  <span className="text-[10px] text-slate-400">Retail Paint Shop Owner</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
