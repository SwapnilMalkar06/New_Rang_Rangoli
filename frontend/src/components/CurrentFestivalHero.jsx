import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingBag, Sparkles, Store, ChevronDown, Calendar, ArrowRight } from 'lucide-react';

// Real-time 12-Month Festival Schedule mapping to the current month's festival
export const MONTHLY_FESTIVALS = [
  {
    monthIndex: 0, // January
    monthNameEn: 'January',
    monthNameMr: 'जानेवारी',
    festiveMonthEn: 'Paush / Magh',
    festiveMonthMr: 'पौष / माघ',
    festivalId: 'makar-sankranti',
    nameEn: 'Makar Sankranti & Kite Festival',
    nameMr: 'मकर संक्रांत व पतंगोत्सव',
    taglineEn: 'Sky-blue colors, soaring kite stencils & fine white Sanskar Bharati powders.',
    taglineMr: 'पतंग नक्षी, हळदी-कुंकू स्टॅन्सिल आणि संक्रांत विशेष शुभ्र व तेजस्वी रांगोळी रंग.',
    image: '/festivals/makar-sankranti.png',
    tag: 'Makar Sankranti',
    theme: 'default',
    accentGradient: 'from-amber-500 via-sky-500 to-orange-500',
    glowColor: 'rgba(14, 165, 233, 0.45)'
  },
  {
    monthIndex: 1, // February
    monthNameEn: 'February',
    monthNameMr: 'फेब्रुवारी',
    festiveMonthEn: 'Magh / Phalgun',
    festiveMonthMr: 'माघ / फाल्गुन',
    festivalId: 'holi',
    nameEn: 'Spring Season & Pre-Holi',
    nameMr: 'वसंत ऋतू व होळी पूर्वतयारी',
    taglineEn: '100% skin-safe organic herbal colors and scented royal pink gulal.',
    taglineMr: '१००% त्वचेसाठी सुरक्षित सेंद्रिय हर्बल रंग व सुगंधी शाही गुलाबी गुलाल.',
    image: '/festivals/holi.png',
    tag: 'Holi',
    theme: 'default',
    accentGradient: 'from-pink-500 via-teal-500 to-emerald-500',
    glowColor: 'rgba(236, 72, 153, 0.45)'
  },
  {
    monthIndex: 2, // March
    monthNameEn: 'March',
    monthNameMr: 'मार्च',
    festiveMonthEn: 'Phalgun / Chaitra',
    festiveMonthMr: 'फाल्गुन / चैत्र',
    festivalId: 'holi',
    nameEn: 'Holi & Dhulivandan Grand Rangotsav',
    nameMr: 'रंगोत्सव होळी व धुलीवंदन',
    taglineEn: 'Vibrant herbal gulal, water squirters and festive organic powders.',
    taglineMr: 'सेंद्रिय हर्बल गुलाल, रंगपंचमी संच आणि सुरक्षित सण रंग.',
    image: '/festivals/holi.png',
    tag: 'Holi',
    theme: 'default',
    accentGradient: 'from-pink-500 via-teal-500 to-emerald-500',
    glowColor: 'rgba(20, 184, 166, 0.45)'
  },
  {
    monthIndex: 3, // April
    monthNameEn: 'April',
    monthNameMr: 'एप्रिल',
    festiveMonthEn: 'Chaitra / Vaishakh',
    festiveMonthMr: 'चैत्र / वैशाख',
    festivalId: 'gudi-padwa',
    nameEn: 'Gudi Padwa & Marathi New Year',
    nameMr: 'गुढीपाडवा व मराठी नववर्ष',
    taglineEn: 'Sacred Swastik, Shobha Yatra stencils & blossom-fresh rangoli powders.',
    taglineMr: 'शोभायात्रा स्टॅन्सिल, पवित्र स्वस्तिक आणि नववर्षाचे स्वागत रंग.',
    image: '/festivals/gudi-padwa.png',
    tag: 'Gudi Padwa',
    theme: 'default',
    accentGradient: 'from-emerald-500 via-lime-500 to-amber-500',
    glowColor: 'rgba(16, 185, 129, 0.45)'
  },
  {
    monthIndex: 4, // May
    monthNameEn: 'May',
    monthNameMr: 'मे',
    festiveMonthEn: 'Vaishakh / Jyeshtha',
    festiveMonthMr: 'वैशाख / ज्येष्ठ',
    festivalId: 'gudi-padwa',
    nameEn: 'Auspicious Celebrations & Shobha Yatra',
    nameMr: 'शुभ कार्ये व पारंपारिक रंग उत्सव',
    taglineEn: 'Sanskar Bharati borders, mandala patterns and royal temple powders.',
    taglineMr: 'संस्कार भारती बॉर्डर्स, मंडला नक्षी आणि देवघर रांगोळी रंग.',
    image: '/festivals/gudi-padwa.png',
    tag: 'Gudi Padwa',
    theme: 'default',
    accentGradient: 'from-emerald-500 via-lime-500 to-amber-500',
    glowColor: 'rgba(16, 185, 129, 0.45)'
  },
  {
    monthIndex: 5, // June
    monthNameEn: 'June',
    monthNameMr: 'जून',
    festiveMonthEn: 'Jyeshtha / Ashadha',
    festiveMonthMr: 'ज्येष्ठ / आषाढ',
    festivalId: 'raksha-bandhan',
    nameEn: 'Pre-Shravan & Auspicious Bonds',
    nameMr: 'श्रावण पूर्वतयारी व सणांची चाहूल',
    taglineEn: 'Delicate thali border stencils and precision rangoli pen tools.',
    taglineMr: 'पूजा थाळी स्टॅन्सिल आणि नाजूक रांगोळी पेन साधने.',
    image: '/festivals/raksha-bandhan.png',
    tag: 'Raksha Bandhan',
    theme: 'default',
    accentGradient: 'from-rose-500 via-pink-500 to-red-500',
    glowColor: 'rgba(244, 63, 94, 0.45)'
  },
  {
    monthIndex: 6, // July
    monthNameEn: 'July',
    monthNameMr: 'जुलै',
    festiveMonthEn: 'Ashadha / Shravan',
    festiveMonthMr: 'आषाढ / श्रावण',
    festivalId: 'raksha-bandhan',
    nameEn: 'Pavitra Shravan & Raksha Bandhan',
    nameMr: 'पवित्र श्रावण मास व रक्षाबंधन',
    taglineEn: 'Puja thali stencils, soft pastel shades and precision rangoli pens.',
    taglineMr: 'पूजा थाळी बॉर्डर स्टॅन्सिल, अचूक रांगोळी पेन आणि मंगलमय रंग.',
    image: '/festivals/raksha-bandhan.png',
    tag: 'Raksha Bandhan',
    theme: 'default',
    accentGradient: 'from-rose-500 via-pink-500 to-red-500',
    glowColor: 'rgba(244, 63, 94, 0.45)'
  },
  {
    monthIndex: 7, // August
    monthNameEn: 'August',
    monthNameMr: 'ऑगस्ट',
    festiveMonthEn: 'Shravan / Bhadrapad',
    festiveMonthMr: 'श्रावण / भाद्रपद',
    festivalId: 'ganpati',
    nameEn: 'Ganesh Chaturthi (Ganeshotsav Welcoming)',
    nameMr: 'श्री गणेशोत्सव विशेष आगमन',
    taglineEn: 'Modak & Bappa stencils, eco-friendly vibrant colors & chowki rollers.',
    taglineMr: 'बाप्पाच्या आगमनासाठी पर्यावरणपूरक रंग, मोदक आणि सुंदर गणेश स्टॅन्सिल.',
    image: '/festivals/ganpati.png',
    tag: 'Ganpati',
    theme: 'ganeshChaturthi',
    accentGradient: 'from-amber-500 via-orange-600 to-red-600',
    glowColor: 'rgba(234, 88, 12, 0.45)'
  },
  {
    monthIndex: 8, // September
    monthNameEn: 'September',
    monthNameMr: 'सप्टेंबर',
    festiveMonthEn: 'Bhadrapad / Ashwin',
    festiveMonthMr: 'भाद्रपद / अश्विन',
    festivalId: 'ganpati',
    nameEn: 'Ganesh Chaturthi Mahotsav',
    nameMr: 'श्री गणेश चतुर्थी महोत्सव',
    taglineEn: 'Super-fine organic rangoli colors, grand mandap decor and stencils.',
    taglineMr: 'गणपती बाप्पासाठी पर्यावरणपूरक रंग आणि सुंदर मंडप सजावट.',
    image: '/festivals/ganpati.png',
    tag: 'Ganpati',
    theme: 'ganeshChaturthi',
    accentGradient: 'from-amber-500 via-orange-600 to-red-600',
    glowColor: 'rgba(234, 88, 12, 0.45)'
  },
  {
    monthIndex: 9, // October
    monthNameEn: 'October',
    monthNameMr: 'ऑक्टोबर',
    festiveMonthEn: 'Ashwin / Kartik',
    festiveMonthMr: 'अश्विन / कार्तिक',
    festivalId: 'navaratri-dussehra',
    nameEn: 'Navaratri & Dussehra (Vijayadashami)',
    nameMr: 'शारदीय नवरात्रोत्सव व दसरा (विजयादशमी)',
    taglineEn: '9 holy night colors, Garba Dandiya stencils & marigold yellow borders.',
    taglineMr: '९ पवित्र रात्रींसाठी ९ मंगलमय रंग, गरबा-दांडिया स्टॅन्सिल आणि दसरा विजय चौक.',
    image: '/festivals/navaratri-dussehra.png',
    tag: 'Navaratri & Dussehra',
    theme: 'default',
    accentGradient: 'from-rose-600 via-amber-600 to-orange-600',
    glowColor: 'rgba(225, 29, 72, 0.45)'
  },
  {
    monthIndex: 10, // November
    monthNameEn: 'November',
    monthNameMr: 'नोव्हेंबर',
    festiveMonthEn: 'Kartik / Margashirsha',
    festiveMonthMr: 'कार्तिक / मार्गशीर्ष',
    festivalId: 'diwali',
    nameEn: 'Grand Diwali (Deepavali) & Lakshmi Pujan',
    nameMr: 'तेजोमय दीपावली महोत्सव व लक्ष्मीपूजन',
    taglineEn: 'Sanskar Bharati white powders, Lakshmi charan stencils, glitter & neon shades.',
    taglineMr: 'लक्ष्मी पावले, संस्कार भारती मंडला, चमकदार ग्लिटर आणि निऑन रांगोळी रंग.',
    image: '/festivals/diwali.png',
    tag: 'Diwali',
    theme: 'diwali',
    accentGradient: 'from-purple-600 via-pink-600 to-amber-500',
    glowColor: 'rgba(168, 85, 247, 0.45)'
  },
  {
    monthIndex: 11, // December
    monthNameEn: 'December',
    monthNameMr: 'डिसेंबर',
    festiveMonthEn: 'Margashirsha / Paush',
    festiveMonthMr: 'मार्गशीर्ष / पौष',
    festivalId: 'diwali',
    nameEn: 'Diwali Illuminations & Festive Glow',
    nameMr: 'भव्य दीपोत्सव व सण विशेष',
    taglineEn: 'Brighten every celebration with premium fine powders and stencils.',
    taglineMr: 'घराघरात प्रकाश आणि मांगल्याचे रंग.',
    image: '/festivals/diwali.png',
    tag: 'Diwali',
    theme: 'diwali',
    accentGradient: 'from-purple-600 via-pink-600 to-amber-500',
    glowColor: 'rgba(234, 88, 12, 0.45)'
  }
];

const CurrentFestivalHero = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  // Real-time detection: find the current month's festival (0-11)
  const currentFestival = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return MONTHLY_FESTIVALS[currentMonth] || MONTHLY_FESTIVALS[10];
  }, []);

  const festivalName = isMarathi ? currentFestival.nameMr : currentFestival.nameEn;
  const monthName = isMarathi ? currentFestival.monthNameMr : currentFestival.monthNameEn;
  const festiveMonth = isMarathi ? currentFestival.festiveMonthMr : currentFestival.festiveMonthEn;
  const tagline = isMarathi ? currentFestival.taglineMr : currentFestival.taglineEn;

  const shopUrl = `/shop?tag=${encodeURIComponent(currentFestival.tag)}&theme=${encodeURIComponent(currentFestival.theme)}`;

  const scrollToFestivals = (e) => {
    e.preventDefault();
    const el = document.getElementById('festival-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white select-none">
      
      {/* Dynamic Ambient Background Aura Matching the Festival Color Palette */}
      <div 
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${currentFestival.glowColor} 0%, rgba(2, 6, 23, 0.85) 60%, rgba(2, 6, 23, 1) 100%)`
        }}
      />

      {/* Animated Festive Bokeh & Light Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/30 blur-sm"
            style={{
              width: `${(i % 4) * 6 + 6}px`,
              height: `${(i % 4) * 6 + 6}px`,
              left: `${(i * 8.3) % 95}%`,
              bottom: '-20px'
            }}
            animate={{
              y: [0, -750],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1.3, 0.9]
            }}
            transition={{
              duration: 8 + (i % 5) * 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.7
            }}
          />
        ))}
      </div>

      {/* Main Full-Area Container */}
      <div className="relative w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-8 sm:pt-4 sm:pb-12 flex flex-col items-center">
        
        {/* The Entire Screen Hero Area Dedicated to the Festival Image with Cinematic Animation */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950 group">
          
          {/* Subtle Ambient Color Glow Under the Card */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${currentFestival.accentGradient} opacity-30 blur-2xl pointer-events-none`} />

          {/* Clickable Image Canvas with Breathing Animation */}
          <Link
            to={shopUrl}
            className="block relative w-full h-[54vh] sm:h-[65vh] md:h-[75vh] lg:h-[82vh] min-h-[440px] max-h-[820px] overflow-hidden cursor-pointer"
            title={isMarathi ? `${festivalName} खरेदी करा` : `Shop ${festivalName}`}
          >
            {/* The ONLY festival image for the current month */}
            <motion.img
              src={currentFestival.image}
              alt={festivalName}
              className="w-full h-full object-contain sm:object-cover object-center filter drop-shadow-2xl"
              animate={{
                scale: [1, 1.04, 1],
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Cinematic Gradient Overlays to preserve artwork visibility and enhance text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-slate-950/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40 pointer-events-none" />

            {/* Glowing Corner Badge */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-950/85 border border-white/20 backdrop-blur-md px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xl">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>{festivalName}</span>
              </span>
            </div>

            {/* Bottom Glassmorphic Floating Control Bar */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-8 sm:right-8 z-20 flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-white/20 backdrop-blur-xl shadow-2xl">
              
              {/* Festival Details */}
              <div className="text-center md:text-left space-y-1">
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center justify-center md:justify-start gap-2">
                  <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                    {festivalName}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  {tagline}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = shopUrl;
                  }}
                  className={`flex-1 md:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${currentFestival.accentGradient} hover:opacity-95 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg hover:scale-102 transition-all duration-200`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>
                    {isMarathi
                      ? `${currentFestival.nameMr.split(' ')[0]} रंग व साहित्य`
                      : `Shop ${currentFestival.tag} Collection`}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  to="/wholesale"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-4 py-3 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all duration-200"
                >
                  <Store className="h-4 w-4 text-orange-400" />
                  <span>{isMarathi ? 'घाऊक' : 'Wholesale'}</span>
                </Link>

                <button
                  type="button"
                  onClick={scrollToFestivals}
                  className="hidden sm:flex items-center justify-center h-11 w-11 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all duration-200"
                  title={isMarathi ? 'खाली स्क्रोल करा' : 'Explore All Festivals'}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

            </div>

          </Link>

        </div>

      </div>

    </section>
  );
};

export default CurrentFestivalHero;
