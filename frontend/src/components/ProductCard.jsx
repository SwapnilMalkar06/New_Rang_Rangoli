import { useLanguage } from '../context/LanguageContext';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { Lock } from 'lucide-react';

/**
 * Helper to match category themes
 */
const getCategoryStyles = (category) => {
  switch (category) {
    case 'Rangoli':
      return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs';
    case 'Sanskar Bharati Rangoli':
      return 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs';
    case 'Portrait Color':
      return 'bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-xs';
    case 'Fluorescent Color':
      return 'bg-gradient-to-r from-lime-500 to-emerald-500 text-white shadow-xs';
    case 'Tools':
      return 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xs';
    case 'Holi Color':
      return 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-xs';
    case 'Gulal':
      return 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-xs';
    default:
      return 'bg-slate-500 text-white shadow-xs';
  }
};

const getCardGlowClass = (category) => {
  switch (category) {
    case 'Rangoli': return 'hover:shadow-orange-500/10 hover:border-orange-500/30';
    case 'Sanskar Bharati Rangoli': return 'hover:shadow-rose-500/10 hover:border-rose-500/30';
    case 'Portrait Color': return 'hover:shadow-violet-500/10 hover:border-violet-500/30';
    case 'Fluorescent Color': return 'hover:shadow-lime-500/10 hover:border-lime-500/30';
    case 'Tools': return 'hover:shadow-blue-500/10 hover:border-blue-500/30';
    case 'Holi Color': return 'hover:shadow-amber-500/10 hover:border-amber-500/30';
    case 'Gulal': return 'hover:shadow-pink-500/10 hover:border-pink-500/30';
    default: return 'hover:shadow-slate-500/10 hover:border-slate-500/30';
  }
};

const ProductCard = ({ product, themeAccent = 'orange', onAddToCart }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);
  
  const {
    name,
    nameMR,
    description,
    descriptionMR,
    mainCategory,
    subCategory,
    price,
    wholesalePrice,
    minWholesaleQuantity,
    stockQuantity,
    imageUrls,
    tags = [],
    seasonalDiscount,
    currentPrice,
    isDiscountActive
  } = product;

  const displayName = language === 'mr' && nameMR ? nameMR : name;
  const displayDescription = language === 'mr' && descriptionMR ? descriptionMR : description;

  // Determine button color classes depending on the active theme
  const getThemeButtonClass = () => {
    switch (themeAccent) {
      case 'orange': // Ganesh Chaturthi
        return 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:ring-orange-300';
      case 'indigo': // Diwali
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 focus:ring-indigo-300';
      case 'crimson': // Wedding
        return 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 focus:ring-rose-300';
      default: // Default Store
        return 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 focus:ring-teal-300';
    }
  };

  const buttonAccent = getThemeButtonClass();
  const mainImage = imageUrls && imageUrls[0] ? imageUrls[0] : 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400';

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl dark:border-slate-800/40 dark:bg-slate-900/60 ${getCardGlowClass(mainCategory)}`}>
      
      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={mainImage}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400';
          }}
        />

        {/* Category Badge */}
        <span className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow ${getCategoryStyles(mainCategory)}`}>
          {mainCategory}
        </span>

        {/* Discount Tag */}
        {isDiscountActive && (
          <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
            {seasonalDiscount.discountPercentage}% OFF
          </span>
        )}

        {/* Out of Stock Overlay */}
        {stockQuantity === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <span className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          {subCategory}
        </div>

        <h3 className="mb-1 text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-slate-950 dark:group-hover:text-white line-clamp-1 transition-colors">
          {displayName}
        </h3>

        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
          {displayDescription}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Pricing and Action row */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col">
            {isWholesaler ? (
              <>
                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">
                  Wholesale Price
                </span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{wholesalePrice.toFixed(2)}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  MOQ: {minWholesaleQuantity} units
                </span>
              </>
            ) : isDiscountActive ? (
              <>
                <span className="text-xs text-slate-400 line-through">
                  ₹{price.toFixed(2)}
                </span>
                <span className="text-lg font-extrabold text-red-600 dark:text-red-400">
                  ₹{currentPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                ₹{price.toFixed(2)}
              </span>
            )}

            {/* Stock Alert */}
            {stockQuantity > 0 && stockQuantity <= 5 && (
              <span className="mt-1 text-[10px] font-semibold text-orange-600 dark:text-orange-400 animate-pulse">
                Only {stockQuantity} left!
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (!user) {
                navigate('/login?redirect=/shop');
                return;
              }
              onAddToCart && onAddToCart(product);
            }}
            disabled={stockQuantity === 0}
            className={`flex items-center justify-center rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-md transition-all duration-300 focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none cursor-pointer ${
              !user ? 'bg-slate-900 hover:bg-orange-600 dark:bg-slate-800 dark:hover:bg-orange-600' : buttonAccent
            }`}
          >
            {!user ? (
              <>
                <Lock className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
                <span>{language === 'mr' ? 'लॉगिन करा' : 'Sign in to Cart'}</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1.5 h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
