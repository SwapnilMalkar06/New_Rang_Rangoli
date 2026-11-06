import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { addToCart } from '../store/cartSlice';
import { Plus, Minus, ShoppingBag, Check, Sparkles, ZoomIn, Eye, Lock } from 'lucide-react';

const SanskarBharatiColorCard = ({ color }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);

  const [selectedWeight, setSelectedWeight] = useState('500gm');
  const [packetCount, setPacketCount] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const weightInfo = color.weights[selectedWeight] || color.weights['500gm'];
  const unitPrice = isWholesaler ? weightInfo.wholesalePrice : weightInfo.retailPrice;
  const totalPrice = unitPrice * packetCount;

  const handleIncrement = () => {
    setPacketCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setPacketCount((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login?redirect=/shop?category=Sanskar%20Bharati%20Rangoli');
      return;
    }

    dispatch(
      addToCart({
        product: {
          _id: color.id,
          id: color.id,
          name: `${color.nameEn} (${selectedWeight})`,
          nameMR: `${color.nameMr} (${selectedWeight})`,
          description: color.descriptionEn,
          descriptionMR: color.descriptionMr,
          mainCategory: 'Sanskar Bharati Rangoli',
          subCategory: 'Super-Fine Powder',
          imageUrls: [color.image],
          image: color.image,
          price: weightInfo.retailPrice,
          wholesalePrice: weightInfo.wholesalePrice,
          minWholesaleQuantity: 10,
          stockQuantity: 999
        },
        quantity: packetCount,
        selectedWeight: selectedWeight,
        customPrice: weightInfo.retailPrice,
        customWholesalePrice: weightInfo.wholesalePrice
      })
    );

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 2000);
  };

  const weightKeys = ['250gm', '500gm', '1000gm'];

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-rose-200/60 dark:border-rose-950/40 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-md">
      
      {/* Visual Bowl & Realistic Texture Section */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200/70 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 border-b border-rose-100/60 dark:border-slate-800">
        
        {/* Ambient subtle color aura behind bowl */}
        <div
          className="absolute h-40 w-40 rounded-full blur-2xl opacity-35 transition-opacity duration-300 group-hover:opacity-60"
          style={{ backgroundColor: color.hex }}
        />

        {/* Circular Cup/Bowl with Real Sanskar Bharati Powder Texture */}
        <div 
          className="relative h-44 w-44 sm:h-48 sm:w-48 rounded-full overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 transition-transform duration-500 group-hover:scale-105 cursor-pointer"
          onClick={() => setIsZoomed(!isZoomed)}
          title="Click to toggle texture macro view"
        >
          {/* Actual cropped powder bowl from reference photo */}
          <img
            src={color.image}
            alt={color.nameEn}
            loading="lazy"
            className={`h-full w-full object-cover rounded-full transition-all duration-700 ${
              isZoomed ? 'scale-175' : 'scale-102 group-hover:scale-110'
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/colors/sanskar-bharati-chart.jpg';
            }}
          />

          {/* Ultra-soft silky velvety powder depth overlay (no coarse grain) */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none opacity-25 mix-blend-soft-light"
            style={{
              backgroundImage: `radial-gradient(circle at 45% 40%, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.2) 85%)`
            }}
          />

          {/* Soft Powder Velvet Rim Edge */}
          <div className="absolute inset-0 rounded-full pointer-events-none shadow-[inset_0_3px_8px_rgba(0,0,0,0.22)]" />

          {/* Soft Powder Zoom Pill Overlay on Hover */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Eye className="h-3 w-3 text-amber-400" />
            <span>{isZoomed ? 'Reset View' : (isMarathi ? 'मऊ पावडर रचना' : 'Soft Powder View')}</span>
          </div>
        </div>

        {/* Shade Number Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md px-2.5 py-1 text-white shadow-lg">
          <span
            className="h-3 w-3 rounded-full border border-white shadow-xs shrink-0"
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-[11px] font-extrabold tracking-wide">
            #{color.number}
          </span>
        </div>

        {/* Soft Powder Structure Seal */}
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-2.5 py-0.5 text-[9px] font-extrabold text-white shadow-md uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          <span>{isMarathi ? 'अतिशय मऊ पावडर' : 'Ultra-Soft Powder'}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Title */}
        <div className="mb-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              {color.nameEn}
            </h3>
            <span
              className="h-3.5 w-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0 shadow-xs"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          </div>
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
            {color.nameMr}
          </p>
        </div>

        {/* Soft Powder Structure Highlight Pill */}
        <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <span className="line-clamp-1">
              {isMarathi ? 'अतिशय मऊ व रेशमी पावडर रचना (५-बोटांच्या नक्षीसाठी)' : 'Ultra-Smooth Soft Powder Structure'}
            </span>
          </div>
        </div>

        {/* Weight Selector: 3 Required Buttons (250gm, 500gm, 1000gm) */}
        <div className="mb-3 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {isMarathi ? 'वजन निवडा (Weight):' : 'Select Weight:'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {weightKeys.map((wKey) => {
              const isSelected = selectedWeight === wKey;
              const priceForWeight = isWholesaler
                ? color.weights[wKey].wholesalePrice
                : color.weights[wKey].retailPrice;

              return (
                <button
                  key={wKey}
                  type="button"
                  onClick={() => setSelectedWeight(wKey)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-[1.03]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black">{wKey}</span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      isSelected
                        ? 'text-rose-100'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    ₹{priceForWeight}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Packet Quantity Stepper */}
        <div className="mb-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isMarathi ? 'पाकिटे संख्या:' : 'Packets:'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              ₹{unitPrice} × {packetCount}
            </span>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={packetCount <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease packets"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-black text-slate-900 dark:text-white">
              {packetCount}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
              aria-label="Increase packets"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Pricing Total & Add to Cart Action */}
        <div className="mt-auto pt-1 space-y-2">
          
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {isWholesaler ? 'Wholesale Total:' : 'Total Price:'}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white">
              ₹{totalPrice.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold transition-all duration-300 shadow-md cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/20 scale-[1.01]'
                : !user
                ? 'bg-slate-900 text-white hover:bg-rose-600 dark:bg-slate-800 dark:hover:bg-rose-600 shadow-slate-900/20'
                : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:opacity-95 text-white shadow-rose-500/20 hover:scale-[1.02]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>{isMarathi ? 'कार्टमध्ये जोडले! ✓' : 'Added to Cart! ✓'}</span>
              </>
            ) : !user ? (
              <>
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>{isMarathi ? 'खरेदीसाठी लॉगिन करा 🔒' : 'Sign In to Add to Cart 🔒'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {isMarathi
                    ? `कार्टमध्ये जोडा (${selectedWeight})`
                    : `Add to Cart (${selectedWeight})`}
                </span>
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};

export default SanskarBharatiColorCard;
