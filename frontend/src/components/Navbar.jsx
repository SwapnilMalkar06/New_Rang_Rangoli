import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { selectCartItems } from '../store/cartSlice';
import { logout, selectUser, selectIsWholesaler } from '../store/authSlice';
import { ShoppingCart, Languages, LogOut, User, Store, Package } from 'lucide-react';

const CATEGORIES = [
  { key: 'Rangoli', labelKey: 'catRangoli', emoji: '🌸', desc: 'Traditional fine colors', colorClass: 'hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/20' },
  { key: 'Sanskar Bharati Rangoli', labelKey: 'catSanskarBharati', emoji: '🌀', desc: 'Pattern powder & stencils', colorClass: 'hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20' },
  { key: 'Portrait Color', labelKey: 'catPortraitColor', emoji: '🎨', desc: 'Skin & realistic tones', colorClass: 'hover:text-violet-500 dark:hover:text-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/20' },
  { key: 'Fluorescent Color', labelKey: 'catFluorescentColor', emoji: '⚡', desc: 'UV-reactive neon shades', colorClass: 'hover:text-lime-500 dark:hover:text-lime-400 hover:bg-lime-50/50 dark:hover:bg-lime-950/20' },
  { key: 'Tools', labelKey: 'catTools', emoji: '🔧', desc: 'Pens, rollers & stencils', colorClass: 'hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20' },
  { key: 'Holi Color', labelKey: 'catHoliColor', emoji: '🌈', desc: 'Eco-friendly herbal powders', colorClass: 'hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20' },
  { key: 'Gulal', labelKey: 'catGulal', emoji: '💖', desc: 'Scented organic pink gulal', colorClass: 'hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/20' },
];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language, setLanguage, t } = useLanguage();
  const cartItems = useSelector(selectCartItems);
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'mr' : 'en');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md shadow-xs transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <span className="flex items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 p-2 text-white shadow-md">
                🌸
              </span>
              <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 bg-clip-text text-transparent font-outfit">
                New Rang Rangoli
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              {t('navHome')}
            </Link>
            
            {/* Categories Dropdown / Mega Menu */}
            <div className="relative group py-4">
              <button className="flex items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors focus:outline-hidden">
                <span>{t('navShop')}</span>
                <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu Panel */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[480px] rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible dark:border-slate-800/60 dark:bg-slate-950/95 z-50">
                <div className="mb-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('navCategories')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.key}
                      to={`/shop?category=${encodeURIComponent(cat.key)}`}
                      className={`flex items-start gap-3 rounded-2xl p-2.5 transition-all duration-300 ${cat.colorClass}`}
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg shadow-sm dark:bg-slate-900">
                        {cat.emoji}
                      </span>
                      <div className="text-left">
                        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t(cat.labelKey)}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                          {cat.desc}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* View All catalog banner */}
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-900">
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 py-2 text-xs font-bold text-orange-500 transition-colors"
                  >
                    <span>Browse All Products</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            <Link to="/wholesale" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-1">
              <Store className="h-4 w-4" />
              {t('navWholesale')}
            </Link>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              title="Change Language"
            >
              <Languages className="h-4 w-4 text-orange-500" />
              <span>{language === 'en' ? 'मराठी' : 'English'}</span>
            </button>

            {/* Cart Icon Link */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center rounded-xl p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              <ShoppingCart className="h-5.5 w-5.5 text-slate-700 dark:text-slate-200" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User status & Authentication */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 px-3 py-1.5 hover:border-orange-400 dark:hover:border-orange-500 transition-all group"
                  title="View Account & Orders"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-500 to-rose-600 text-xs font-bold text-white shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-500 transition-colors">
                      {user.name?.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400">
                      {isWholesaler ? 'Wholesaler' : 'Customer'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-2 text-xs font-bold hover:bg-rose-600 dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-300 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('navLogout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white px-3.5 py-2 text-xs font-bold hover:shadow-lg hover:from-orange-600 hover:to-rose-700 transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>{t('navLogin')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden flex flex-col border-t border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
          <div className="flex items-center justify-around py-2">
            <Link to="/" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
              {t('navHome')}
            </Link>
            <Link to="/shop" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
              {t('navShop')}
            </Link>
            <Link to="/wholesale" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-500 transition-colors">
              {t('navWholesale')}
            </Link>
            {user ? (
              <Link to="/account" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                {t('myAccountTitle')}
              </Link>
            ) : (
              <Link to="/login" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                {t('navLogin')}
              </Link>
            )}
          </div>
          {/* Mobile Categories Scroll Quick-Bar */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 border-t border-slate-100 dark:border-slate-900 scrollbar-none select-none">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                to={`/shop?category=${encodeURIComponent(cat.key)}`}
                className="flex items-center gap-1.5 shrink-0 rounded-full bg-slate-100 dark:bg-slate-900 px-3 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-500"
              >
                <span>{cat.emoji}</span>
                <span>{t(cat.labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
