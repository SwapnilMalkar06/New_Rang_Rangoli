import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { SANSKAR_BHARATI_COLORS } from '../data/sanskarBharatiColorsData';
import SanskarBharatiColorCard from './SanskarBharatiColorCard';
import {
  Sparkles,
  Search,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Palette,
  ShieldCheck,
  Feather
} from 'lucide-react';

const SanskarBharatiColorCatalog = ({ isEmbedded = false, externalSearch = '' }) => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  const [colorsList, setColorsList] = useState(SANSKAR_BHARATI_COLORS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [showChartModal, setShowChartModal] = useState(false);

  // Fetch updated catalog from backend
  useEffect(() => {
    fetch('/api/colors?type=sanskar_bharati')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.sanskarBharati?.length > 0) {
          setColorsList(data.data.sanskarBharati);
        }
      })
      .catch(() => {});
  }, []);

  const activeSearch = (externalSearch || searchQuery).toLowerCase().trim();

  // Filter colors
  const filteredColors = useMemo(() => {
    return colorsList.filter((color) => {
      // Group filter
      if (selectedGroup === 'warm' && !['Vibrant Warm'].includes(color.category)) return false;
      if (selectedGroup === 'royal' && !['Deep Royal', 'Cool Pastel'].includes(color.category)) return false;
      if (selectedGroup === 'rich' && !['Rich Tone'].includes(color.category)) return false;
      if (selectedGroup === 'pastel-neon' && !['Soft Pastel', 'Neon Glow', 'Festive Vibrant'].includes(color.category)) return false;
      if (selectedGroup === 'white' && color.category !== 'Foundation Essential') return false;

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
  }, [selectedGroup, activeSearch, colorsList]);

  return (
    <div className={`w-full ${isEmbedded ? 'py-2' : 'py-8 md:py-14 bg-slate-50 dark:bg-slate-950'} text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
      
      {/* Top Header Banner for Sanskar Bharati Rangoli */}
      <div className={`${isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} mb-6`}>
        
        {/* Header Title & Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-rose-200/60 dark:border-slate-800 pb-5">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-3.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <Feather className="h-3.5 w-3.5" />
              <span>{isMarathi ? 'अस्सल संस्कार भारती शेड्स' : 'Authentic Sanskar Bharati Powder'}</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isMarathi ? 'संस्कार भारती रांगोळी रंग कॅटलॉग' : 'Sanskar Bharati Rangoli Colors'}</span>
              <span className="text-sm font-semibold text-rose-500 dark:text-rose-400">
                ({isMarathi ? 'अतिशय मऊ व रेशमी पावडर रचना' : 'Ultra-Soft Smooth Powder Structure'})
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isMarathi
                ? '५-बोटांच्या संस्कार भारती नक्षीसाठी आणि अखंड आउटलाइनिंगसाठी खास तयार केलेली अतिशय मऊ, रेशमी मखमली रांगोळी पावडर रचना (खडबडीत कण किंवा रेती नाही). २५० ग्रॅम, ५०० ग्रॅम आणि १००० ग्रॅम पाकिटे उपलब्ध.'
                : 'Formulated with an ultra-soft, silky smooth powder structure (zero coarse grains) designed for 5-finger spreads, smooth mandalas, and flowing continuous outlines. Available in 250gm, 500gm, and 1000gm packets.'}
            </p>
          </div>

          {/* Button to view original bowls photo */}
          <button
            type="button"
            onClick={() => setShowChartModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs transition-all self-start md:self-auto cursor-pointer shrink-0"
          >
            <ImageIcon className="h-4 w-4 text-rose-500" />
            <span>{isMarathi ? 'मूळ रंग वाट्यांचा फोटो पहा' : 'View Original Color Bowls'}</span>
          </button>
        </div>

        {/* Texture Features Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-5">
          <div className="flex items-center gap-2 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-2.5 shadow-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              ✦
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isMarathi ? 'अतिशय मऊ व रेशमी पावडर रचना' : 'Ultra-Soft Smooth Powder Structure'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isMarathi ? 'खडबडीत कण नसलेली मखमली पावडर - बोटांतून सहज वाहते' : 'Zero coarse grains - silky powder flows like velvet'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-2.5 shadow-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              🖐️
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isMarathi ? 'पंचबोटे रांगोळीसाठी परिपूर्ण' : 'Ideal for 5-Finger Spreads'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isMarathi ? 'संस्कार भारती मंडला, वर्तुळे आणि सलग रेषा' : 'Effortless continuous lines & seamless mandalas'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-2.5 shadow-xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
              🛡️
            </span>
            <div className="text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isMarathi ? '१००% सुरक्षित व पर्यावरणपूरक' : '100% Skin-Safe & Organic'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isMarathi ? 'मऊ हातांना सुरक्षित, सहज धुतले जाते' : 'Safe for hands, washes clean without residue'}
              </span>
            </div>
          </div>
        </div>

        {/* Filter and Sub-category Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'all'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              {isMarathi ? 'सर्व संस्कार रंग' : 'All Shades'} ({SANSKAR_BHARATI_COLORS.length})
            </button>

            <button
              onClick={() => setSelectedGroup('warm')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'warm'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              ☀️ {isMarathi ? 'सोनेरी व केसरी' : 'Warm Tones'}
            </button>

            <button
              onClick={() => setSelectedGroup('royal')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'royal'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              🌊 {isMarathi ? 'रॉयल निळे व हिरवे' : 'Blues & Greens'}
            </button>

            <button
              onClick={() => setSelectedGroup('rich')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'rich'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              🍇 {isMarathi ? 'शाही जांभळे व मरून' : 'Wine & Maroon'}
            </button>

            <button
              onClick={() => setSelectedGroup('pastel-neon')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'pastel-neon'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              ✨ {isMarathi ? 'पेस्टल व निऑन' : 'Pastel & Neon'}
            </button>

            <button
              onClick={() => setSelectedGroup('white')}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedGroup === 'white'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              ⚪ {isMarathi ? 'पांढरी पावडर' : 'White Foundation'}
            </button>
          </div>

          {!isEmbedded && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMarathi ? 'संस्कार रंग शोधा (उदा. Blue, Yellow)...' : 'Search shade (e.g. Blue, Yellow)...'}
                className="w-full rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500/50 shadow-xs"
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

      {/* Grid of 15+1 Sanskar Bharati Cards */}
      <div className={isEmbedded ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {filteredColors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Palette className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isMarathi ? 'कोणताही रंग सापडला नाही' : 'No matching shades found'}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {isMarathi ? 'कृपया वेगळा शब्द शोधून पहा किंवा फिल्टर रीसेट करा.' : 'Try adjusting your search criteria.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('all');
              }}
              className="rounded-xl bg-rose-600 text-white px-3.5 py-1.5 text-xs font-bold"
            >
              {isMarathi ? 'सर्व रंग दाखवा' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredColors.map((color) => (
              <SanskarBharatiColorCard key={color.id} color={color} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Original Sanskar Bharati Color Bowls Photo */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Feather className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-bold">
                  {isMarathi ? 'मूळ संस्कार भारती रांगोळी वाट्या (Original Reference Photo)' : 'Original Sanskar Bharati Color Bowls'}
                </h3>
              </div>
              <button
                onClick={() => setShowChartModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto flex justify-center bg-slate-100 dark:bg-slate-950">
              <img
                src="/colors/sanskar-bharati-chart.jpg"
                alt="Original Sanskar Bharati Rangoli Bowls"
                className="rounded-xl shadow max-w-full h-auto object-contain"
              />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
              {isMarathi
                ? 'फोटोतील सर्व १५ रंग आमच्या कॅटलॉगमध्ये २५० ग्रॅम, ५०० ग्रॅम आणि १००० ग्रॅम पाकिटांमध्ये उपलब्ध आहेत.'
                : 'All 15 colors shown in the photo are available in 250gm, 500gm, and 1000gm packets.'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SanskarBharatiColorCatalog;
