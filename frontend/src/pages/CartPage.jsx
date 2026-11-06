import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { selectCartItems, updateQuantity, removeFromCart, selectCartTotal } from '../store/cartSlice';
import { selectIsWholesaler, selectUser } from '../store/authSlice';
import { Plus, Minus, Trash2, ArrowRight, Store, AlertTriangle, Sparkles, User } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);
  const cartItems = useSelector(selectCartItems);
  const total = useSelector((state) => selectCartTotal(state, isWholesaler));

  const handleIncrement = (item) => {
    const id = item.cartItemId || item.product._id || item.product.id;
    dispatch(updateQuantity({ cartItemId: id, quantity: item.quantity + 1 }));
  };

  const handleDecrement = (item) => {
    const minLimit = isWholesaler ? (item.product.minWholesaleQuantity || 1) : 1;
    if (item.quantity > minLimit) {
      const id = item.cartItemId || item.product._id || item.product.id;
      dispatch(updateQuantity({ cartItemId: id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = (item) => {
    const id = item.cartItemId || item.product._id || item.product.id;
    dispatch(removeFromCart(id));
  };

  const hasWholesaleErrors = isWholesaler && cartItems.some(
    item => item.quantity < item.product.minWholesaleQuantity
  );

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) return;
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (hasWholesaleErrors) {
      alert('Please adjust quantities to meet the Wholesaler Minimum Order Quantity (MOQ) for all items.');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col justify-center items-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">{t('cartHeader')}</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{t('cartIsEmpty')}</p>
        <Link to="/shop" className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white px-6 py-3 text-xs font-bold shadow-md hover:scale-102 transition-all">
          {t('exploreCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-extrabold tracking-tight mb-8 font-outfit text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800 pb-3">
          {t('cartHeader')}
        </h1>

        {/* Customer Login Prompt / Active Status Banner */}
        {!user ? (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border border-amber-500/30 p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{t('loginRequiredPrompt')}</span>
            </div>
            <Link
              to="/login?redirect=/cart"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2 text-xs font-bold shadow-xs hover:from-orange-600 hover:to-amber-700 shrink-0 transition-all"
            >
              <span>{t('navLogin')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
            <span>✓ Logged in as <strong>{user.name}</strong> ({user.email})</span>
            <Link to="/account" className="font-bold underline text-[11px] hover:text-emerald-800">
              {t('myAccountTitle')} →
            </Link>
          </div>
        )}

        {isWholesaler && (
          <div className="mb-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-4 text-xs text-indigo-600 dark:text-indigo-400 flex items-start gap-2.5">
            <Store className="h-5 w-5 shrink-0 text-indigo-500" />
            <p>{t('wholesaleCartAlert')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const displayName = language === 'mr' && product.nameMR ? product.nameMR : product.name;
              const itemPrice = isWholesaler 
                ? (item.customWholesalePrice != null ? item.customWholesalePrice : product.wholesalePrice)
                : (item.customPrice != null ? item.customPrice : (product.currentPrice || product.price));
              const isMOQViolated = isWholesaler && item.quantity < (product.minWholesaleQuantity || 1);
              const mainImage = product.imageUrls && product.imageUrls[0] 
                ? product.imageUrls[0] 
                : (product.image || 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=400');
              const itemKey = item.cartItemId || product._id || product.id;

              return (
                <div
                  key={itemKey}
                  className={`flex flex-col sm:flex-row gap-4 items-center justify-between rounded-2xl border bg-white/60 dark:bg-slate-900/60 p-4 backdrop-blur-md transition-all shadow-xs ${
                    isMOQViolated
                      ? 'border-red-500/50 bg-red-500/5 dark:bg-red-950/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                      : 'border-white/20 dark:border-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={mainImage}
                      alt={displayName}
                      className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-white"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1 flex items-center gap-2">
                        <span>{displayName}</span>
                        {item.selectedWeight && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            {item.selectedWeight}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                        {product.mainCategory || 'Rangoli Color'}
                      </p>
                      
                      {isWholesaler ? (
                        <div className="flex flex-col mt-1">
                          <span className="text-xs font-bold text-indigo-500">
                            Wholesale: ₹{(itemPrice || 0).toFixed(2)}
                          </span>
                          {product.minWholesaleQuantity && (
                            <span className="text-[9px] text-slate-400">
                              MOQ: {product.minWholesaleQuantity} units
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          ₹{(itemPrice || 0).toFixed(2)} / pack
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center gap-6 justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 overflow-hidden">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={item.quantity <= (isWholesaler ? (product.minWholesaleQuantity || 1) : 1)}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 text-xs font-bold w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white w-20 text-right">
                        ₹{((itemPrice || 0) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item)}
                        className="rounded-xl p-2.5 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4 rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-6 backdrop-blur-md shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800 pb-3">
              Order Summary
            </h2>
            
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-500">{t('cartTotal')}</span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-outfit">
                ₹{total.toFixed(2)}
              </span>
            </div>

            {hasWholesaleErrors && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-[11px] text-red-500 flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <p>One or more items do not meet the minimum wholesale quantity requirement.</p>
              </div>
            )}

            <button
              onClick={handleProceedToCheckout}
              disabled={hasWholesaleErrors}
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-white font-bold py-3.5 px-4 text-xs hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                !user 
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:brightness-110 shadow-amber-500/20' 
                  : 'bg-gradient-to-r from-orange-500 to-rose-600 shadow-orange-500/10 hover:scale-102'
              }`}
            >
              {!user ? (
                <>
                  <span>{t('loginToCheckout')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>{t('checkoutHeader')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
