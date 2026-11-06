import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { selectCartItems, selectCartTotal } from '../store/cartSlice';
import { selectIsWholesaler } from '../store/authSlice';
import { RANGOLI_COLORS } from '../data/rangoliColorsData';
import RangoliColorCard from './RangoliColorCard';
import {
  Palette,
  Search,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  X
} from 'lucide-react';

const RangoliColorCatalog = ({ isEmbedded = false, externalSearch = '' }) => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const isWholesaler = useSelector(selectIsWholesaler);
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector((state) => selectCartTotal(state, isWholesaler));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showShadeCardModal, setShowShadeCardModal] = useState(false);

  // Active search query (either passed from shop search or local search)
  const activeSearch = (externalSearch || searchQuery).toLowerCase().trim();

  // Filter colors based on category and search query
  const filteredColors = useMemo(() => {
    return RANGOLI_COLORS.filter((color) => {
      // Category filter
      if (selectedCategory === 'standard' && color.category !== 'Standard') return false;
      if (selectedCategory === 'fluorescent' && color.category !== 'Fluorescent') return false;
      if (selectedCategory === 'white' && color.category !== 'White Powder') return false;

      // Search query filter
      if (activeSearch) {
        const matchesNameEn = color.nameEn.toLowerCase().includes(activeSearch);
        const matchesNameMr = color.nameMr.toLowerCase().includes(activeSearch);
        const matchesNumber = color.number.toLowerCase().includes(activeSearch);
        const matchesCategory = color.category.toLowerCase().includes(activeSearch);
        return matchesNameEn || matchesNameMr || matchesNumber || matchesCategory;
      }

      return true;
    });
  }, [selectedCategory, activeSearch]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`w-full ${isEmbedded ? 'py-2' : 'py-8 md:py-14 bg-slate-50 dark:bg-slate-950'} text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
      
      {/* Top Header Banner for Rangoli Shade Card */}
      <div className={`${isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} mb-6`}>
        
        {/* Header Title & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-slate-200/60 dark:border-slate-800 pb-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-0.5 text-xs font-bold text-orange-600 dark:text-orange-400">
              <Palette className="h-3.5 w-3.5" />
              <span>{isMarathi ? 'अस्सल २३ शेड कार्ड कॅटलॉग' : 'Official 23 Shades Chart'}</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isMarathi ? '२३ अस्सल रांगोळी रंग शेड्स (२५०g, ५००g, १०००g)' : '23 Authentic Rangoli Color Shades'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isMarathi
                ? 'प्रत्येक रंगासाठी २५० ग्रॅम, ५०० ग्रॅम आणि १००० ग्रॅम (१ किलो) पाकिटे निवडा आणि आवश्यक पाकिटांची संख्या निवडून थेट कार्टमध्ये जोडा.'
                : 'Choose any shade, select 250gm, 500gm, or 1000gm packets, adjust the number of packets, and add straight to your cart.'}
            </p>
          </div>

          {/* Button to view full physical shade card */}
          <button
            type="button"
            onClick={() => setShowShadeCardModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs transition-all self-start md:self-auto cursor-pointer shrink-0"
          >
            <ImageIcon className="h-4 w-4 text-orange-500" />
            <span>{isMarathi ? 'मूळ शेड कार्ड फोटो पहा' : 'View Original Shade Card'}</span>
          </button>
        </div>

        {/* Filter and Sub-category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              {isMarathi ? 'सर्व रंग' : 'All Shades'} ({RANGOLI_COLORS.length})
            </button>

            <button
              onClick={() => setSelectedCategory('standard')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'standard'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              {isMarathi ? 'पारंपारिक रंग' : 'Standard Colors'} (18)
            </button>

            <button
              onClick={() => setSelectedCategory('fluorescent')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'fluorescent'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              ✨ {isMarathi ? 'निऑन फ्लोरोसंट' : 'Fluorescent Neon'} (4)
            </button>

            <button
              onClick={() => setSelectedCategory('white')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'white'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              ⚪ {isMarathi ? 'पांढरी रांगोळी' : 'White Rangoli'} (1)
            </button>
          </div>

          {/* Local search box if not already searching from parent */}
          {!isEmbedded && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMarathi ? 'रंग शोधा (उदा. Red, 10, Pista)...' : 'Search shade (e.g. Red, 10, Pista)...'}
                className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 23 Individual Color Cards Grid */}
      <div className={isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {filteredColors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Palette className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isMarathi ? 'कोणताही रंग सापडला नाही' : 'No matching shades found'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {isMarathi ? 'कृपया वेगळा शब्द शोधून पहा किंवा फिल्टर रीसेट करा.' : 'Try adjusting your search query.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="rounded-xl bg-orange-500 text-white px-3.5 py-1.5 text-xs font-bold"
            >
              {isMarathi ? 'सर्व रंग दाखवा' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredColors.map((color) => (
              <RangoliColorCard key={color.id} color={color} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky Bottom Quick Cart Bar when items are in cart (only on standalone view) */}
      {!isEmbedded && totalCartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-40">
          <Link
            to="/cart"
            className="flex items-center gap-3 rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 px-5 py-3.5 shadow-2xl border border-white/20 hover:scale-103 transition-all duration-300"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 text-orange-400 dark:text-orange-600" />
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white">
                {totalCartCount}
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-medium opacity-80">
                {isMarathi ? `${totalCartCount} वस्तू कार्टमध्ये` : `${totalCartCount} items in cart`}
              </span>
              <span className="text-sm font-black">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      )}

      {/* Lightbox Modal for Original Printed Shade Card */}
      {showShadeCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-orange-400" />
                <h3 className="text-sm font-bold">
                  {isMarathi ? 'अधिकृत रांगोळी शेड कार्ड (Original Chart)' : 'Official Printed Shade Card Chart'}
                </h3>
              </div>
              <button
                onClick={() => setShowShadeCardModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto flex justify-center bg-slate-100 dark:bg-slate-950">
              <img
                src="/colors/shade-card.jpg"
                alt="Original Rangoli Shade Card"
                className="rounded-xl shadow max-w-full h-auto object-contain"
              />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              {isMarathi
                ? 'वरील सर्व २३ रंग आमच्या कॅटलॉगमध्ये २५० ग्रॅम, ५०० ग्रॅम आणि १००० ग्रॅम पॅक स्वरूपात उपलब्ध आहेत.'
                : 'All 23 shades shown are available above in 250gm, 500gm, and 1000gm packets.'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RangoliColorCatalog;
