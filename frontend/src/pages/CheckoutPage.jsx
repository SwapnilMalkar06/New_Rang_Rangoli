import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
import { selectUser, selectIsWholesaler } from '../store/authSlice';
import { Truck, ShoppingBag, CreditCard, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Zap, MapPin } from 'lucide-react';
import { lookupPincode } from '../utils/pincodeService';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, language } = useLanguage();
  
  const user = useSelector(selectUser);
  const isWholesaler = useSelector(selectIsWholesaler);
  const cartItems = useSelector(selectCartItems);
  const total = useSelector((state) => selectCartTotal(state, isWholesaler));

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Structured Address with PIN code auto-fill
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [streetAddress, setStreetAddress] = useState('');
  const [localities, setLocalities] = useState([]);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeFeedback, setPincodeFeedback] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState('Razorpay'); // 'Razorpay' or 'COD'
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Auto-fill City & State on 6-digit PIN code entry
  const handlePincodeChange = async (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 6);
    setPincode(digits);

    if (digits.length === 6) {
      setPincodeLoading(true);
      setPincodeFeedback(null);
      const res = await lookupPincode(digits);
      setPincodeLoading(false);

      if (res.success) {
        setCity(res.city || res.district);
        if (res.state) setStateName(res.state);
        setLocalities(res.localities || []);
        if (res.localities && res.localities.length === 1) {
          setSelectedLocality(res.localities[0]);
        }
        setPincodeFeedback({
          type: 'success',
          message: `✓ City identified: ${res.city}, ${res.state}`
        });
      } else {
        setPincodeFeedback({
          type: 'warning',
          message: res.message || 'Could not auto-detect city. Please type city manually.'
        });
      }
    } else {
      setPincodeFeedback(null);
      setLocalities([]);
      setSelectedLocality('');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
  }, [user, navigate]);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setCheckoutError('');

    if (!pincode || pincode.length !== 6) {
      setCheckoutError('Please enter a valid 6-digit postal PIN code.');
      return;
    }
    if (!city.trim()) {
      setCheckoutError('Please enter your city.');
      return;
    }
    if (!streetAddress.trim()) {
      setCheckoutError('Please enter your house no., street address, or landmark.');
      return;
    }

    const fullShippingAddress = `${streetAddress.trim()}${selectedLocality ? `, ${selectedLocality}` : ''}, ${city.trim()}, ${stateName.trim()} - ${pincode.trim()}`;

    try {
      setLoading(true);
      
      const payload = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: fullShippingAddress,
        isWholesale: isWholesaler || false,
        totalPrice: total,
        paymentMethod: paymentMethod,
        items: cartItems.map(item => {
          const product = item.product || {};
          const itemPrice = isWholesaler 
            ? (item.customWholesalePrice != null ? item.customWholesalePrice : product.wholesalePrice)
            : (item.customPrice != null ? item.customPrice : (product.currentPrice || product.price));
          const prodName = product.name || product.nameEn || 'Rangoli Product';
          const prodImage = (product.imageUrls && product.imageUrls[0]) || product.image || '';

          return {
            productId: product._id || product.id,
            product: product._id || product.id,
            name: prodName,
            nameMR: product.nameMR || '',
            selectedWeight: item.selectedWeight || '',
            image: prodImage,
            price: itemPrice,
            quantity: item.quantity
          };
        })
      };

      // Step 1: Create initial order in database
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }

      const createdOrder = data.data;

      // Step 2: Handle Payment
      if (paymentMethod === 'Razorpay') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection or choose Cash on Delivery.');
        }

        // Call backend to create Razorpay Order
        const rzpOrderRes = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            receipt: createdOrder._id
          })
        });
        const rzpOrderData = await rzpOrderRes.json();

        if (!rzpOrderRes.ok || !rzpOrderData.success) {
          throw new Error(rzpOrderData.message || 'Failed to initiate Razorpay payment order');
        }

        // If in simulation mode (no live Razorpay keys provided yet), complete smoothly
        if (rzpOrderData.isSimulated) {
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: rzpOrderData.orderId,
              razorpay_payment_id: `pay_sim_${Date.now()}`,
              razorpay_signature: 'simulated_signature',
              orderId: createdOrder._id
            })
          });

          dispatch(clearCart());
          setLoading(false);
          navigate(`/order-success/${createdOrder._id}`);
          return;
        }

        // Real Razorpay Checkout modal
        const options = {
          key: rzpOrderData.keyId,
          amount: rzpOrderData.amount,
          currency: rzpOrderData.currency,
          name: 'New Rang Rangoli',
          description: 'Authentic Indian Rangoli Colors & Supplies',
          order_id: rzpOrderData.orderId,
          prefill: {
            name: name,
            email: email,
            contact: phone
          },
          theme: {
            color: '#ea580c'
          },
          handler: async function (response) {
            try {
              const verifyRes = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: createdOrder._id
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                dispatch(clearCart());
                setLoading(false);
                navigate(`/order-success/${createdOrder._id}`);
              } else {
                setCheckoutError('Payment verification failed on server. Please contact support with Payment ID: ' + response.razorpay_payment_id);
                setLoading(false);
              }
            } catch (vErr) {
              setCheckoutError('Error verifying payment: ' + vErr.message);
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.on('payment.failed', function (failResponse) {
          setCheckoutError(`Payment failed: ${failResponse.error?.description || 'Payment was declined.'}`);
          setLoading(false);
        });
        razorpayInstance.open();
      } else {
        // Cash on delivery
        dispatch(clearCart());
        setLoading(false);
        navigate(`/order-success/${createdOrder._id}`);
      }
    } catch (err) {
      setCheckoutError(err.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="mx-auto max-w-5xl">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Cart</span>
        </Link>

        <h1 className="text-3xl font-extrabold tracking-tight mb-8 font-outfit text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800 pb-3">
          Checkout Details
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Shipping Form */}
          <div className="lg:col-span-7 rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-8 backdrop-blur-md shadow-md">
            
            {/* Customer Status Banner */}
            {!user ? (
              <div className="mb-6 rounded-2xl bg-orange-500/10 border border-orange-500/20 p-3.5 text-xs flex items-center justify-between gap-3">
                <span className="text-slate-700 dark:text-slate-300">
                  Already have an account? <strong>Log in</strong> to auto-fill details and track this order.
                </span>
                <Link
                  to="/login?redirect=/checkout"
                  className="shrink-0 rounded-xl bg-orange-500 px-3.5 py-1.5 font-bold text-white hover:bg-orange-600 transition-colors"
                >
                  {t('navLogin')}
                </Link>
              </div>
            ) : (
              <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                <span>✓ Contact details auto-filled for <strong>{user.name}</strong></span>
                <span className="text-[11px] font-semibold">{user.email}</span>
              </div>
            )}

            <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('checkoutFormHeader')}
              </h2>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                isWholesaler 
                  ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' 
                  : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
              }`}>
                {isWholesaler ? t('checkoutModeWholesale') : t('checkoutModeRetail')}
              </span>
            </div>

            {checkoutError && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {checkoutError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t('checkoutFullName')}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('checkoutEmail')}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sharma@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('checkoutPhone')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 99887 76655"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              {/* STEP 1: PIN CODE (FIRST) WITH AUTO-CITY DETECTION */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    <span>Postal PIN Code (पिनकोड) *</span>
                  </label>
                  {pincodeLoading && (
                    <span className="text-[11px] text-orange-600 dark:text-orange-400 flex items-center gap-1 font-semibold animate-pulse">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Detecting city...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 416416 or 411038"
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950 px-4 py-3 text-sm font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal focus:border-orange-500 focus:bg-white outline-hidden transition-colors"
                  />
                  {pincode.length === 6 && !pincodeLoading && city && (
                    <div className="absolute right-3.5 top-3.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {pincodeFeedback && (
                  <div
                    className={`mt-1.5 text-xs flex items-center gap-1.5 font-bold ${
                      pincodeFeedback.type === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    <span>{pincodeFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* STEP 2: AUTO-FILLED CITY & STATE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    City / District (शहर / जिल्हा) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Auto-detected from PIN code"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-hidden transition-colors"
                    />
                    {city && (
                      <span className="absolute right-3 top-3 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Auto-detected
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    State (राज्य) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/70 dark:border-slate-700 dark:bg-slate-950 px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:border-orange-500 outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Optional Post Office / Locality selector if available */}
              {localities.length > 1 && (
                <div>
                  <label className="block mb-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    Specific Area / Post Office in {city} (Optional):
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="">-- Select local area or leave general --</option>
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* STEP 3: HOUSE / STREET / LANDMARK DETAILS */}
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Flat No., Building Name, Street & Landmark (सविस्तर पत्ता) *
                </label>
                <textarea
                  required
                  rows="2"
                  placeholder="e.g. Flat 402, Shree Shanti Heights, Near Ganpati Temple, Market Road"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                ></textarea>
              </div>

              {/* LIVE COMBINED ADDRESS PREVIEW */}
              {(pincode || city || streetAddress) && (
                <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-900 dark:text-orange-300 block mb-1">
                    📍 Delivery Address Preview:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                    {streetAddress ? `${streetAddress}, ` : ''}
                    {selectedLocality ? `${selectedLocality}, ` : ''}
                    {city ? `${city}, ` : ''}
                    {stateName} {pincode ? `- ${pincode}` : ''}
                  </p>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Razorpay Online */}
                  <label
                    className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'Razorpay'
                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="Razorpay"
                          checked={paymentMethod === 'Razorpay'}
                          onChange={() => setPaymentMethod('Razorpay')}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-orange-500" />
                          <span>Razorpay Online</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      UPI, Google Pay, PhonePe, Paytm, Credit/Debit Cards, NetBanking.
                    </p>
                  </label>

                  {/* Cash On Delivery */}
                  <label
                    className={`relative flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/20 shadow-md ring-2 ring-orange-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                          <span>Cash on Delivery</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        COD
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-6">
                      Pay cash or UPI upon delivery at your doorstep.
                    </p>
                  </label>

                </div>
              </div>

              {/* Security badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>256-bit SSL encrypted secure checkout powered by Razorpay.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-bold py-3.5 px-4 text-xs sm:text-sm hover:shadow-lg shadow-orange-500/20 hover:scale-101 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order & Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>
                      {paymentMethod === 'Razorpay'
                        ? `Pay ₹${total.toFixed(2)} with Razorpay`
                        : `Place Order (COD) • ₹${total.toFixed(2)}`}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Cart Sidebar Preview */}
          <div className="lg:col-span-5 rounded-3xl border border-white/20 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/40 p-6 backdrop-blur-md shadow-md space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200/50 dark:border-slate-800 pb-3">
              Items in Order
            </h2>

            <div className="divide-y divide-slate-200/40 dark:divide-slate-800/60 max-h-60 overflow-y-auto space-y-3">
              {cartItems.map((item) => {
                const product = item.product || {};
                const displayName = language === 'mr' && product.nameMR ? product.nameMR : (product.name || product.nameEn);
                const itemPrice = isWholesaler 
                  ? (item.customWholesalePrice != null ? item.customWholesalePrice : product.wholesalePrice)
                  : (item.customPrice != null ? item.customPrice : (product.currentPrice || product.price));
                const itemKey = item.cartItemId || product._id || product.id;

                return (
                  <div key={itemKey} className="flex justify-between text-xs py-2">
                    <div className="max-w-xs pr-4">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block line-clamp-1">
                        {displayName} {item.selectedWeight && <span className="text-[10px] text-orange-500 font-bold">({item.selectedWeight})</span>}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Qty: {item.quantity} x ₹{(itemPrice || 0).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      ₹{((itemPrice || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200/60 dark:border-slate-800 pt-4 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Payment Due:
              </span>
              <span className="text-2xl font-extrabold text-orange-500 font-outfit">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
