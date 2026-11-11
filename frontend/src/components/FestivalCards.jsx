import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ArrowRight, Layers, Star, CheckCircle2, ShoppingBag } from 'lucide-react';

export const FESTIVALS = [
  {
    id: 'ganpati',
    slug: 'ganpati',
    tag: 'Ganpati',
    searchQuery: 'Ganpati',
    category: 'Rangoli',
    emoji: '🌸',
    secondaryEmoji: '🐘',
    nameEn: 'Ganpati (Ganesh Chaturthi)',
    nameMr: 'श्री गणेशोत्सव विशेष',
    seasonBadgeEn: 'Bhadrapad • Aug-Sep',
    seasonBadgeMr: 'भाद्रपद • गणेश चतुर्थी',
    taglineEn: 'Eco-friendly vibrant colors, Modak & Bappa stencils, and chowki border rollers for auspicious arrivals.',
    taglineMr: 'बाप्पाच्या आगमनासाठी पर्यावरणपूरक रंग, मोदक आणि सुंदर गणेश स्टॅन्सिल व चौकी रोलर्स.',
    specialtiesEn: ['Eco-friendly Powders', 'Modak & Bappa Stencils', 'Chowki Border Rollers'],
    specialtiesMr: ['पर्यावरणपूरक रंग', 'मोदक व बाप्पा स्टॅन्सिल', 'चौकी बॉर्डर रोलर्स'],
    accentGradient: 'from-amber-500 via-orange-600 to-red-600',
    glowColor: 'group-hover:shadow-orange-500/25',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    bannerImage: '/festivals/ganpati.png',
    filterGroup: 'major',
    theme: 'ganeshChaturthi',
    popularBadgeEn: 'Most Popular',
    popularBadgeMr: 'सर्वाधिक पसंती'
  },
  {
    id: 'diwali',
    slug: 'diwali',
    tag: 'Diwali',
    searchQuery: 'Diwali',
    category: 'Rangoli',
    emoji: '✨',
    secondaryEmoji: '🪔',
    nameEn: 'Diwali (Deepavali)',
    nameMr: 'तेजोमय दीपावली महोत्सव',
    seasonBadgeEn: 'Kartik • Oct-Nov',
    seasonBadgeMr: 'कार्तिक • दीपोत्सव',
    taglineEn: 'Sanskar Bharati white powders, Lakshmi charan stencils, glitter & fluorescent neon shades.',
    taglineMr: 'लक्ष्मी पावले, संस्कार भारती मंडला, चमकदार ग्लिटर आणि निऑन रांगोळी रंगांनी घर उजळवा.',
    specialtiesEn: ['Sanskar Bharati White', 'Lakshmi Footsteps', 'Neon & Glitter Powders'],
    specialtiesMr: ['संस्कार भारती पांढरी पावडर', 'लक्ष्मी पावले स्टॅन्सिल', 'निऑन व ग्लिटर पावडर'],
    accentGradient: 'from-purple-600 via-pink-600 to-amber-500',
    glowColor: 'group-hover:shadow-purple-500/25',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    bannerImage: '/festivals/diwali.png',
    filterGroup: 'autumn',
    theme: 'diwali',
    popularBadgeEn: 'Grand Deepotsav',
    popularBadgeMr: 'भव्य दीपोत्सव'
  },
  {
    id: 'holi',
    slug: 'holi',
    tag: 'Holi',
    searchQuery: 'Holi',
    category: 'Holi Color',
    emoji: '🌈',
    secondaryEmoji: '🎨',
    nameEn: 'Holi & Dhulivandan',
    nameMr: 'रंगोत्सव होळी व धुलीवंदन',
    seasonBadgeEn: 'Phalgun • Feb-Mar',
    seasonBadgeMr: 'फाल्गुन • रंगपंचमी',
    taglineEn: '100% skin-safe organic herbal colors, scented royal pink gulal & water color squirters.',
    taglineMr: '१००% त्वचेसाठी सुरक्षित सेंद्रिय हर्बल रंग, सुगंधी शाही गुलाबी गुलाल व सुरक्षित रंगपंचमी संच.',
    specialtiesEn: ['100% Herbal Gulal', 'Skin-Safe Non-Toxic', 'Water-Soluble Squirters'],
    specialtiesMr: ['१००% हर्बल गुलाल', 'विषमुक्त सेंद्रिय', 'वॉटर स्क्विर्टर्स'],
    accentGradient: 'from-teal-500 via-emerald-600 to-pink-500',
    glowColor: 'group-hover:shadow-emerald-500/25',
    badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
    bannerImage: '/festivals/holi.png',
    filterGroup: 'spring',
    theme: 'default',
    popularBadgeEn: 'Skin Safe Certified',
    popularBadgeMr: 'त्वचेसाठी सुरक्षित'
  },
  {
    id: 'navaratri-dussehra',
    slug: 'navaratri-dussehra',
    tag: 'Navaratri & Dussehra',
    searchQuery: 'Navaratri Dussehra',
    category: 'Rangoli',
    emoji: '🔱',
    secondaryEmoji: '🏹',
    nameEn: 'Navaratri & Dussehra (Vijayadashami)',
    nameMr: 'शारदीय नवरात्रोत्सव व दसरा (विजयादशमी)',
    seasonBadgeEn: 'Ashwin • Sep-Oct',
    seasonBadgeMr: 'अश्विन • नवरात्र व दसरा',
    taglineEn: '9 auspicious vibrant colors for holy nights, Garba Dandiya stencils, royal marigold yellow powders & Vijayadashami victory borders.',
    taglineMr: '९ पवित्र रात्रींसाठी ९ मंगलमय रंग, गरबा-दांडिया स्टॅन्सिल, झेंडू पिवळा-केसरी रंग आणि दसरा विजय चौक रांगोळी.',
    specialtiesEn: ['9-Day Festive Color Packs', 'Marigold Yellow & Orange', 'Garba & Victory Stencils'],
    specialtiesMr: ['९ दिवसांचे रंग संच', 'झेंडू पिवळा व केसरी रंग', 'गरबा व विजय चौक स्टॅन्सिल'],
    accentGradient: 'from-rose-600 via-amber-600 to-orange-600',
    glowColor: 'group-hover:shadow-orange-500/25',
    badgeColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    bannerImage: '/festivals/navaratri-dussehra.png',
    filterGroup: ['autumn', 'major'],
    theme: 'default',
    popularBadgeEn: 'Navaratri & Vijayadashami',
    popularBadgeMr: 'नवरात्र व विजयादशमी विशेष'
  },
  {
    id: 'makar-sankranti',
    slug: 'makar-sankranti',
    tag: 'Makar Sankranti',
    searchQuery: 'Makar Sankranti',
    category: 'Rangoli',
    emoji: '🪁',
    secondaryEmoji: '☀️',
    nameEn: 'Makar Sankranti',
    nameMr: 'मकर संक्रांत व पतंगोत्सव',
    seasonBadgeEn: 'Paush • January',
    seasonBadgeMr: 'पौष • मकर संक्रमण',
    taglineEn: 'Sky-blue colors, soaring kite stencils, Haldi-Kunku borders & fine white Sanskar Bharati powders.',
    taglineMr: 'पतंग नक्षी, हळदी-कुंकू स्टॅन्सिल आणि संक्रांत विशेष शुभ्र व तेजस्वी रांगोळी रंग.',
    specialtiesEn: ['Kite Motif Stencils', 'Sun & Halo Mandalas', 'Haldi-Kunku Sets'],
    specialtiesMr: ['पतंग नक्षी स्टॅन्सिल', 'सूर्य मंडला डिझाईन', 'हळदी-कुंकू संच'],
    accentGradient: 'from-sky-500 via-amber-500 to-orange-500',
    glowColor: 'group-hover:shadow-sky-500/25',
    badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    bannerImage: '/festivals/makar-sankranti.png',
    filterGroup: 'spring',
    theme: 'default',
    popularBadgeEn: 'Harvest Specials',
    popularBadgeMr: 'संक्रांत विशेष'
  },
  {
    id: 'gudi-padwa',
    slug: 'gudi-padwa',
    tag: 'Gudi Padwa',
    searchQuery: 'Gudi Padwa',
    category: 'Sanskar Bharati Rangoli',
    emoji: '🚩',
    secondaryEmoji: '🌿',
    nameEn: 'Gudi Padwa (New Year)',
    nameMr: 'गुढीपाडवा व मराठी नववर्ष',
    seasonBadgeEn: 'Chaitra • Mar-Apr',
    seasonBadgeMr: 'चैत्र • मराठी नववर्ष',
    taglineEn: 'Welcome the new year with sacred Swastik, Shobha Yatra stencils & blossom-fresh rangoli powders.',
    taglineMr: 'शोभायात्रा स्टॅन्सिल, पवित्र स्वस्तिक, आणि नववर्षाच्या स्वागतासाठी खास वसंत रंग.',
    specialtiesEn: ['Shobha Yatra Kits', 'Traditional Swastik', 'Blossom Fresh Colors'],
    specialtiesMr: ['शोभायात्रा किट्स', 'पारंपारिक स्वस्तिक', 'ताजे वसंत रंग'],
    accentGradient: 'from-emerald-600 via-lime-600 to-amber-500',
    glowColor: 'group-hover:shadow-emerald-500/25',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    bannerImage: '/festivals/gudi-padwa.png',
    filterGroup: 'spring',
    theme: 'default',
    popularBadgeEn: 'New Year Special',
    popularBadgeMr: 'नववर्ष विशेष'
  },
  {
    id: 'raksha-bandhan',
    slug: 'raksha-bandhan',
    tag: 'Raksha Bandhan',
    searchQuery: 'Raksha Bandhan',
    category: 'Tools',
    emoji: '🌺',
    secondaryEmoji: '💖',
    nameEn: 'Raksha Bandhan & Shravan',
    nameMr: 'रक्षाबंधन व श्रावण उत्सव',
    seasonBadgeEn: 'Shravan • Aug',
    seasonBadgeMr: 'श्रावण • नारळी पौर्णिमा',
    taglineEn: 'Delicate puja thali border stencils, floral rangoli blends & fine pen applicator tools.',
    taglineMr: 'पूजा थाळी बॉर्डर स्टॅन्सिल, नाजूक फुलांचे रंग आणि अचूक रांगोळी पेन साधने.',
    specialtiesEn: ['Puja Thali Stencils', 'Precision Rangoli Pens', 'Soft Pastel Shades'],
    specialtiesMr: ['पूजा थाळी स्टॅन्सिल', 'अचूक रांगोळी पेन', 'पेस्टल रंग संच'],
    accentGradient: 'from-rose-500 via-pink-600 to-red-500',
    glowColor: 'group-hover:shadow-rose-500/25',
    badgeColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    bannerImage: '/festivals/raksha-bandhan.png',
    filterGroup: 'major',
    theme: 'default',
    popularBadgeEn: 'Auspicious Bonds',
    popularBadgeMr: 'स्नेहबंध उत्सव'
  }
];

const FestivalCards = () => {
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredFestivals = activeFilter === 'all'
    ? FESTIVALS
    : FESTIVALS.filter(f => {
        if (Array.isArray(f.filterGroup)) {
          return f.filterGroup.includes(activeFilter);
        }
        return f.filterGroup === activeFilter;
      });

  return (
    <section id="festival-showcase" className="py-16 md:py-24 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-rose-500/15 to-amber-500/15 px-4 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/25 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-orange-500" />
            {t('festivalsBadge')}
          </span>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-slate-900 dark:text-white leading-tight">
            <span className="bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              {t('festivalsTitle')}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            {t('festivalsSubtitle')}
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 scale-102'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              {t('filterAll')} ({FESTIVALS.length})
            </button>
            <button
              onClick={() => setActiveFilter('major')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeFilter === 'major'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 scale-102'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              👑 {t('filterMajor')}
            </button>
            <button
              onClick={() => setActiveFilter('autumn')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeFilter === 'autumn'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 scale-102'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              🪔 {t('filterAutumn')}
            </button>
            <button
              onClick={() => setActiveFilter('spring')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeFilter === 'spring'
                  ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-950 scale-102'
                  : 'bg-white/70 text-slate-700 hover:bg-white border border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
              }`}
            >
              🪁 {t('filterSpring')}
            </button>
          </div>
        </div>

        {/* Festival Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredFestivals.map((fest) => {
            const isMarathi = language === 'mr';
            const festivalName = isMarathi ? fest.nameMr : fest.nameEn;
            const specialties = isMarathi ? fest.specialtiesMr : fest.specialtiesEn;
            const popularBadge = isMarathi ? fest.popularBadgeMr : fest.popularBadgeEn;

            const isHoli = fest.id === 'holi' || fest.tag === 'Holi' || fest.category === 'Holi Color';
            const festivalCategory = fest.category || (isHoli ? 'Holi Color' : 'Rangoli');
            const shopUrl = isHoli
              ? `/shop?category=${encodeURIComponent('Holi Color')}`
              : `/shop?category=${encodeURIComponent(festivalCategory)}&tag=${encodeURIComponent(fest.tag)}&theme=${encodeURIComponent(fest.theme)}`;
            const toolsUrl = `/shop?category=Tools&search=${encodeURIComponent(fest.searchQuery)}`;

            return (
              <div
                key={fest.id}
                className={`flex flex-col rounded-3xl border border-white/40 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 backdrop-blur-md overflow-hidden group ${fest.glowColor}`}
              >
                {/* Visual Banner Header */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  <img
                    src={fest.bannerImage}
                    alt={festivalName}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center">
                    <span className="rounded-full bg-gradient-to-r from-orange-500 to-rose-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Star className="h-3 w-3 fill-white" />
                      {popularBadge}
                    </span>
                  </div>

                  {/* Floating Icon Circle overlapping bottom edge */}
                  <div className="absolute -bottom-4 left-5 flex items-center justify-center h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border-2 border-white/80 dark:border-slate-700 text-2xl transition-transform duration-300 group-hover:scale-110">
                    <span>{fest.secondaryEmoji || fest.emoji}</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 pt-7 flex flex-col flex-grow">
                  {/* Festival Title */}
                  <div className="mb-4">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      {festivalName}
                    </h3>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      {isMarathi ? fest.nameEn : fest.nameMr}
                    </span>
                  </div>

                  {/* Key Specialties Pills */}
                  <div className="mt-auto mb-5 space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                      {t('festivalSpecialties')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {specialties.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/70 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <Link
                      to={shopUrl}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${fest.accentGradient} hover:opacity-95 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-101`}
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>{t('shopFestivalColors')}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>

                    <Link
                      to={toolsUrl}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 px-4 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Layers className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t('exploreKits')}</span>
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Bar */}
        <div className="mt-14 rounded-3xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 p-6 md:p-8 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <span>🌸</span>
              <span>{t('festiveGuarantee')}</span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
              {language === 'mr'
                ? 'स्थानिक कारागीर, गणेशोत्सव मंडळे आणि दिवाळी स्टॉल्ससाठी सवलतीच्या घाऊक दरात थेट पुरवठा उपलब्ध.'
                : 'Bulk order dispatch available for festival mandals, retailer stalls, and community celebrations across Maharashtra & India.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-5 py-2.5 text-xs font-bold hover:shadow-lg transition-all duration-200"
            >
              {t('viewFestiveCatalog')} →
            </Link>
            <Link
              to="/wholesale"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-white transition-all duration-200"
            >
              {t('becomeWholesaler')}
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FestivalCards;
