import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { FESTIVALS } from './FestivalCards';
import { getRealtimeFestivalSlides } from '../utils/festivalCalendar';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Flame,
  ArrowRight,
  Clock,
  Calendar
} from 'lucide-react';

const FestivalHeroSlider = () => {
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  // Get real-time ordered festival slides based on today's month
  const { currentSeason, slides } = getRealtimeFestivalSlides(FESTIVALS);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);

  const activeSlide = slides[currentIndex] || slides[0];

  // Auto-play sliding animation every 5.5s
  useEffect(() => {
    if (isPaused) return;

    autoPlayRef.current = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(autoPlayRef.current);
  }, [isPaused, slides.length]);

  const handlePrev = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleSelect = (idx) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  // Slide transition animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.94
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.94,
      transition: {
        duration: 0.35
      }
    })
  };

  const festivalName = isMarathi ? activeSlide.nameMr : activeSlide.nameEn;
  const secondaryName = isMarathi ? activeSlide.nameEn : activeSlide.nameMr;
  const statusBadge = isMarathi ? activeSlide.statusBadgeMr : activeSlide.statusBadgeEn;
  const specialties = isMarathi ? activeSlide.specialtiesMr : activeSlide.specialtiesEn;
  const seasonTitle = isMarathi ? activeSlide.seasonTitleMr : activeSlide.seasonTitleEn;
  const currentMonthLabel = isMarathi ? currentSeason.monthNameMr : currentSeason.monthNameEn;

  const shopUrl = `/shop?tag=${encodeURIComponent(activeSlide.tag)}&theme=${encodeURIComponent(activeSlide.theme || 'default')}`;

  return (
    <div
      className="relative w-full max-w-xl lg:max-w-md xl:max-w-lg select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Animated Ambient Glow */}
      <div
        className={`absolute -inset-2 bg-gradient-to-r ${activeSlide.accentGradient} opacity-30 blur-2xl rounded-3xl transition-all duration-700 pointer-events-none`}
      />

      {/* Main Glassmorphic Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-slate-900/85 backdrop-blur-xl shadow-2xl">
        
        {/* Real-time Season Status Header Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            {activeSlide.status === 'current' ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>{statusBadge}</span>
              </span>
            ) : activeSlide.status === 'upcoming' ? (
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{statusBadge}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Flame className="h-3.5 w-3.5" />
                <span>{statusBadge}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
            <Calendar className="h-3 w-3 text-orange-400" />
            <span>{currentMonthLabel}</span>
          </div>
        </div>

        {/* Animated Image Slide Container */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeSlide.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              <img
                src={activeSlide.bannerImage}
                alt={festivalName}
                className="w-full h-full object-cover object-center transform scale-102 hover:scale-106 transition-transform duration-700"
              />
              {/* Artistic dark gradients for text clarity */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-transparent to-slate-950/40" />

              {/* Floating Festival Emojis Pill */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md px-3 py-1 shadow-lg">
                <span className="text-base">{activeSlide.emoji}</span>
                <span className="text-base">{activeSlide.secondaryEmoji}</span>
                <span className="text-xs font-semibold text-white/90 ml-1">
                  {activeSlide.tag}
                </span>
              </div>

              {/* Slide Counter / Live Indicator */}
              <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-slate-300">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>
                  {currentIndex + 1} / {slides.length}
                </span>
              </div>

              {/* Overlay content on bottom of the image */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h3 className="text-xl sm:text-2xl font-black tracking-wide drop-shadow-md flex items-center gap-2">
                  <span>{festivalName}</span>
                </h3>
                <p className="text-xs font-medium text-amber-300/90 drop-shadow">
                  {secondaryName} • {seasonTitle}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Prev / Next Controls */}
          <button
            onClick={handlePrev}
            aria-label="Previous Festival"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 border border-white/20 text-white backdrop-blur-md hover:bg-white hover:text-slate-950 transition-all shadow-md active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Festival"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/70 border border-white/20 text-white backdrop-blur-md hover:bg-white hover:text-slate-950 transition-all shadow-md active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Details & CTA Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-white/10 space-y-3">
          
          {/* Specialties tags */}
          <div className="flex flex-wrap gap-1.5">
            {specialties.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-200 border border-white/10"
              >
                <span className="text-amber-400">✦</span>
                <span>{item}</span>
              </span>
            ))}
          </div>

          {/* Quick Festival Quick Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <Link
              to={shopUrl}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${activeSlide.accentGradient} px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>
                {isMarathi
                  ? `${festivalName} विशेष उत्पादने`
                  : `Shop ${activeSlide.nameEn} Specials`}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              to="/shop"
              className="flex items-center justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 px-3 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all"
              title="All Catalogs"
            >
              <span>{isMarathi ? 'सर्व' : 'Catalog'}</span>
            </Link>
          </div>

          {/* Seasonal Slide Selector Quick Tabs */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            {/* Quick Status Links */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {slides.slice(0, 4).map((slide, idx) => {
                const isSelected = idx === currentIndex;
                const isCurrentFest = slide.status === 'current';
                return (
                  <button
                    key={slide.id}
                    onClick={() => handleSelect(idx)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-md scale-105'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {isCurrentFest ? '🔴' : '✨'}
                    <span>{isMarathi ? slide.nameMr.split(' ')[0] : slide.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* Slider Dots */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex
                      ? 'w-5 bg-gradient-to-r from-orange-400 to-rose-500'
                      : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FestivalHeroSlider;
