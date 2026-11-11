import React from 'react';
import { Package, Truck, Navigation, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * 4-Step Customer Parcel Tracking Bar
 * Stages:
 * 1. Packed (Processing / Packed)
 * 2. Parcel Dispatched (Shipped)
 * 3. Parcel Out for Delivery (Out for Delivery)
 * 4. Delivered (Delivered with OTP)
 */
const OrderTrackingBar = ({ fulfillmentStatus, deliveryOtp, createdAt, updatedAt }) => {
  const { language } = useLanguage();
  const isMr = language === 'mr';

  const stages = [
    {
      id: 1,
      key: 'packed',
      labelEn: 'Order Packed',
      labelMr: 'ऑर्डर पॅक झाली',
      descEn: 'Workshop hand-packed your rangoli colors',
      descMr: 'कारखान्यातून रंग पॅक केले आहेत',
      icon: Package
    },
    {
      id: 2,
      key: 'dispatched',
      labelEn: 'Parcel Dispatched',
      labelMr: 'पार्सल रवाना झाले',
      descEn: 'Dispatched for delivery destination',
      descMr: 'डिलिव्हरीसाठी पार्सल रवाना झाले',
      icon: Truck
    },
    {
      id: 3,
      key: 'out_for_delivery',
      labelEn: 'Parcel Out for Delivery',
      labelMr: 'डिलिव्हरीसाठी बाहेर पडले',
      descEn: 'Delivery boy arriving today with your parcel',
      descMr: 'डिलिव्हरी प्रतिनिधी आज येत आहे',
      icon: Navigation
    },
    {
      id: 4,
      key: 'delivered',
      labelEn: 'Parcel Delivered',
      labelMr: 'डिलिव्हरी पूर्ण झाली',
      descEn: 'Handover verified with 4-digit OTP',
      descMr: '४-अंकी ओटीपीने पडताळणी पूर्ण झाली',
      icon: CheckCircle2
    }
  ];

  // Map backend status to 1-4 step index
  const getStageIndex = (status) => {
    switch (status) {
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      case 'Ready-for-Pickup':
        return 2;
      default:
        return 1;
    }
  };

  const currentStageIndex = getStageIndex(fulfillmentStatus);

  // Calculate progress width percentage (0% to 100%)
  const progressPercent = ((currentStageIndex - 1) / (stages.length - 1)) * 100;

  return (
    <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-5 sm:p-7 backdrop-blur-md shadow-lg space-y-6">
      
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500">
            {isMr ? 'थेट पार्सल ट्रॅकिंग' : 'Live Parcel Tracking'}
          </span>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-outfit mt-0.5">
            {isMr ? 'तुमच्या पार्सलची स्थिती' : 'Your Parcel Progress Status'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-xs font-bold font-mono">
            {isMr
              ? currentStageIndex === 1
                ? '१/४: पॅक झाले'
                : currentStageIndex === 2
                ? '२/४: रवाना झाले'
                : currentStageIndex === 3
                ? '३/४: डिलिव्हरीसाठी बाहेर'
                : '४/४: पोहोचले'
              : `Stage ${currentStageIndex}/4: ${stages[currentStageIndex - 1].labelEn}`}
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative px-2 sm:px-6 pt-2 pb-4">
        {/* Background Connecting Line */}
        <div className="absolute top-7 sm:top-8 left-6 right-6 sm:left-12 sm:right-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />

        {/* Filled Active Line */}
        <div
          className="absolute top-7 sm:top-8 left-6 sm:left-12 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-700 z-0"
          style={{ width: `calc(${progressPercent}% * 0.85)` }}
        />

        {/* 4 Step Nodes */}
        <div className="relative grid grid-cols-4 gap-2 z-10">
          {stages.map((stage) => {
            const isCompleted = currentStageIndex >= stage.id;
            const isCurrent = currentStageIndex === stage.id;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center">
                {/* Node Circle */}
                <div
                  className={`flex h-11 w-11 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-emerald-500/20'
                      : isCurrent
                      ? 'border-orange-500 bg-orange-500 text-white shadow-orange-500/30 scale-105'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>

                {/* Node Text */}
                <div className="mt-3 space-y-0.5">
                  <p
                    className={`text-[11px] sm:text-xs font-black line-clamp-1 ${
                      isCompleted
                        ? 'text-slate-900 dark:text-white'
                        : isCurrent
                        ? 'text-orange-600 dark:text-orange-400 font-extrabold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {isMr ? stage.labelMr : stage.labelEn}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block max-w-[120px] mx-auto leading-tight">
                    {isMr ? stage.descMr : stage.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic OTP Notification Callout when Out for Delivery */}
      {currentStageIndex === 3 && (
        <div className="rounded-2xl border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-900 dark:to-orange-950/30 p-4 text-xs space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-base">🔑</span>
            <span className="font-black text-orange-900 dark:text-orange-200">
              {isMr ? 'तुमचा ४-अंकी डिलिव्हरी ओटीपी तयार आहे!' : 'Your 4-Digit Delivery OTP is Active!'}
            </span>
          </div>
          <p className="text-orange-800 dark:text-orange-300">
            {isMr
              ? 'डिलिव्हरी प्रतिनिधी पार्सल घेऊन येत आहे. तुमच्या व्हॉट्सॲपवर पाठवलेला ४-अंकी ओटीपी पार्सल मिळाल्यावर प्रतिनिधीला द्या.'
              : 'Our delivery partner is arriving with your parcel today. Please share the 4-digit OTP sent to your WhatsApp ONLY upon receiving your parcel.'}
          </p>
        </div>
      )}

      {/* Completed Callout when Delivered */}
      {currentStageIndex === 4 && (
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs flex items-center gap-3 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
              {isMr ? 'पार्सल यशस्वीरित्या पोहोचले!' : 'Parcel Delivered Successfully!'}
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              {isMr
                ? 'डिलिव्हरी प्रतिनिधीने ४-अंकी ओटीपी पडताळणी पूर्ण केली आहे. न्यू रंग रांगोळी निवडल्याबद्दल धन्यवाद!'
                : 'Delivery partner has verified the 4-digit OTP at your doorstep. Thank you for celebrating with New Rang Rangoli!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingBar;
