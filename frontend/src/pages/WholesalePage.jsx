import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { loginUser, registerUser, selectAuthLoading, selectAuthError, selectUser, clearError } from '../store/authSlice';

const WholesalePage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const currentUser = useSelector(selectUser);
  const isWholesaler = currentUser && (currentUser.role === 'retailer' || currentUser.isWholesaler);

  const [isLoginTab, setIsLoginTab] = useState(true);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerBusiness, setRegisterBusiness] = useState('');
  const [registerGSTIN, setRegisterGSTIN] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
  }, [isLoginTab, dispatch]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email: loginEmail, password: loginPassword }));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    dispatch(
      registerUser({
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        role: 'retailer', 
        businessName: registerBusiness,
        gstin: registerGSTIN,
        password: registerPassword,
      })
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-rose-500 to-orange-500 bg-clip-text text-transparent mb-4 font-outfit">
            {t('wholesalePortalHeader')}
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
            Partner with us to unlock direct wholesale prices for your paint store or craft business.
          </p>
        </div>

        {isWholesaler ? (
          <div className="space-y-8">
            {/* Active Wholesaler Account Banner */}
            <div className="rounded-3xl bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 p-8 shadow-xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 text-xs font-bold text-indigo-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>✓ Verified Wholesaler Partner</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
                    Welcome, {currentUser.name}
                  </h2>
                  <p className="text-xs text-slate-300">
                    {currentUser.businessName ? `Business: ${currentUser.businessName} • ` : ''}
                    Email: {currentUser.email} • Mobile: {currentUser.phone || 'N/A'}
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold pt-1">
                    ✓ 50% Bulk Wholesale Discount is active across the entire store.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/shop?category=Rangoli"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-5 py-3 text-xs font-bold text-white shadow-lg hover:scale-102 transition-all"
                  >
                    <span>🌸 Shop Wholesale Rangoli</span>
                    <span>→</span>
                  </Link>
                  <Link
                    to="/shop?category=Sanskar%20Bharati%20Rangoli"
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-white/10 px-5 py-3 text-xs font-bold text-white hover:bg-white/20 transition-all"
                  >
                    <span>🌀 Sanskar Bharati Wholesale</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Wholesale Price Sheet & Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-6 backdrop-blur-md shadow-md space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span>🌸 23 Rangoli Color Shades</span>
                  <span className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">Min 10 MOQ</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">250gm Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400">₹3.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">500gm Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400">₹6.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">1000gm (1kg) Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-orange-600 dark:text-orange-400">₹12.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-slate-500">
                    <span>White Rangoli Powder (500g / 1kg)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">₹4.00 / ₹8.00</span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-6 backdrop-blur-md shadow-md space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                  <span>🌀 16 Sanskar Bharati Shades</span>
                  <span className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">Min 10 MOQ</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">250gm Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">₹20.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">500gm Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">₹40.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">1000gm (1kg) Packets (Bulk Wholesale)</span>
                    <span className="font-extrabold text-rose-600 dark:text-rose-400">₹80.00 / packet</span>
                  </div>
                  <div className="flex justify-between items-center py-2 text-slate-500">
                    <span>Sand-Grain White Powder (500g / 1kg)</span>
                    <span className="font-extrabold text-slate-700 dark:text-slate-300">₹8.00 / ₹15.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wholesaler Terms & Order Support Banner */}
            <div className="rounded-2xl bg-indigo-500/10 p-5 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold block mb-0.5">Wholesale Ordering Rules:</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Minimum Order Quantity is 10 packets per shade. Orders are packed in heavy-duty commercial corrugated cartons. Direct GST tax invoice generated upon checkout.
                </p>
              </div>
              <Link
                to="/account"
                className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors"
              >
                View Your Orders →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Benefits panel */}
          <div className="lg:col-span-5 rounded-3xl border border-white/20 bg-white/40 dark:border-slate-800/40 dark:bg-slate-900/40 p-8 backdrop-blur-md shadow-md space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-200/50 dark:border-slate-800/50">
              {t('wholesaleBenefitsHeader')}
            </h2>
            
            <ul className="space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                  ✓
                </span>
                <span>{t('wholesaleBenefit1')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                  ✓
                </span>
                <span>{t('wholesaleBenefit2')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">
                  ✓
                </span>
                <span>{t('wholesaleBenefit3')}</span>
              </li>
            </ul>

            <div className="rounded-2xl bg-indigo-500/10 p-5 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <span className="text-[10px] font-bold uppercase tracking-wider block mb-1">
                Note on Verification
              </span>
              <p className="text-[11px] leading-relaxed">
                Wholesale pricing is applied instantly upon login. We reserve the right to audit business documents during dispatch.
              </p>
            </div>

            {/* Link for normal retail customers */}
            <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
              <p className="text-xs text-slate-500 mb-2">
                Shopping for home or festive celebrations?
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
              >
                <span>Go to Customer Sign In / Shop →</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Login vs Register) */}
          <div className="lg:col-span-7 rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-8 backdrop-blur-md shadow-md">
            
            {/* Nav Tabs */}
            <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 mb-8 pb-3 gap-6">
              <button
                type="button"
                onClick={() => setIsLoginTab(true)}
                className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                  isLoginTab
                    ? 'border-b-2 border-orange-500 text-orange-500 dark:text-orange-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {t('wholesaleLogin')}
              </button>
              <button
                type="button"
                onClick={() => setIsLoginTab(false)}
                className={`text-sm font-bold pb-2 transition-all cursor-pointer ${
                  !isLoginTab
                    ? 'border-b-2 border-orange-500 text-orange-500 dark:text-orange-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {t('wholesaleRegistration')}
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-6 rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {authError}
              </div>
            )}

            {isLoginTab ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('placeholderEmail')}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. dealer@patilpaints.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('placeholderPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-3 px-4 text-xs hover:shadow-lg shadow-orange-500/10 hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Processing Access...' : t('wholesalerSubmitLogin')}
                </button>
              </form>
            ) : (
              /* REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('placeholderFullName')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patil"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('placeholderPhone')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 99887 76655"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('placeholderBusiness')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Patil Colors & Hardware"
                      value={registerBusiness}
                      onChange={(e) => setRegisterBusiness(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('placeholderGSTIN')}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 27AABCU9603R1ZX"
                      value={registerGSTIN}
                      onChange={(e) => setRegisterGSTIN(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('placeholderEmail')}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. business@patilpaints.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('placeholderPassword')}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white/50 px-4 py-3 text-sm focus:border-orange-500 focus:bg-white outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:focus:border-orange-400 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-3 px-4 text-xs hover:shadow-lg shadow-orange-500/10 hover:scale-102 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Submitting Registration...' : t('wholesalerSubmitRegister')}
                </button>
              </form>
            )}

          </div>
        </div>
        )}

      </div>
    </div>
  );
};

export default WholesalePage;
