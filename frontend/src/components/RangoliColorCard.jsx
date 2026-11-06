import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { addToCart } from '../store/cartSlice';
import { Plus, Minus, ShoppingBag, Check, Sparkles } from 'lucide-react';

const RangoliColorCard = ({ color }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isMarathi = language === 'mr';
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);

  const availableWeights = Object.keys(color.weights);
  const [selectedWeight, setSelectedWeight] = useState(
    color.weights['500gm'] ? '500gm' : availableWeights[0]
  );
  const [packetCount, setPacketCount] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const weightInfo = color.weights[selectedWeight] || color.weights['500gm'] || color.weights[availableWeights[0]];
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
      navigate('/login?redirect=/shop?category=Rangoli');
      return;
    }

    dispatch(
      addToCart({
        product: {
          _id: color.id,
          id: color.id,
          name: `${color.nameEn} Rangoli Color (${selectedWeight})`,
          nameMR: `${color.nameMr} रांगोळी रंग (${selectedWeight})`,
          description: color.descriptionEn,
          descriptionMR: color.descriptionMr,
          mainCategory: color.category === 'Fluorescent' ? 'Fluorescent Color' : 'Rangoli',
          subCategory: 'Color Shade Powders',
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

  const weightKeys = availableWeights;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 backdrop-blur-md">
      
      {/* Visual Top Bar / Accent Banner */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 border-b border-slate-100 dark:border-slate-800">
        
        {/* Actual cropped color heap image */}
        <img
          src={color.image}
          alt={color.nameEn}
          loading="lazy"
          className="h-full w-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/colors/shade-card.jpg';
          }}
        />

        {/* Shade Number & Hex Swatch Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-slate-950/80 border border-white/20 backdrop-blur-md px-2.5 py-1 text-white shadow-lg">
          <span
            className="h-3.5 w-3.5 rounded-full border border-white/80 shadow-xs shrink-0"
            style={{ backgroundColor: color.hex }}
          />
          <span className="text-[11px] font-extrabold tracking-wide">
            #{color.number}
          </span>
        </div>

        {/* Category Pill */}
        {color.category === 'Fluorescent' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-2 py-0.5 text-[10px] font-extrabold text-white shadow-md uppercase tracking-wider">
            <Sparkles className="h-3 w-3" />
            <span>Neon Glow</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* Title */}
        <div className="mb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
              {color.nameEn}
            </h3>
            <span
              className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {color.nameMr}
          </p>
        </div>

        {/* Weight Selector: 3 Required Buttons (250gm, 500gm, 1000gm) */}
        <div className="mb-4 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            {isMarathi ? 'वजन निवडा (Weight):' : 'Select Weight:'}
          </label>
          <div className={`grid ${weightKeys.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-1.5 sm:gap-2`}>
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
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-md scale-[1.03]'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-black">{wKey}</span>
                  <span
                    className={`text-[10px] font-semibold mt-0.5 ${
                      isSelected
                        ? 'text-amber-300 dark:text-orange-600'
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
        <div className="mb-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {isMarathi ? 'पाकिटांची संख्या:' : 'Packets:'}
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
            <span className="w-9 text-center text-xs font-black text-slate-900 dark:text-white">
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
        <div className="mt-auto pt-2 space-y-2">
          
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
                ? 'bg-slate-900 text-white hover:bg-orange-600 dark:bg-slate-800 dark:hover:bg-orange-600 shadow-slate-900/20'
                : 'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 hover:opacity-95 text-white shadow-orange-500/20 hover:scale-[1.02]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>{isMarathi ? 'कार्टमध्ये जोडले! ✓' : 'Added to Cart! ✓'}</span>
              </>
            ) : !user ? (
              <span>{isMarathi ? 'खरेदीसाठी लॉगिन करा' : 'Sign In to Add to Cart'}</span>
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

export default RangoliColorCard;
