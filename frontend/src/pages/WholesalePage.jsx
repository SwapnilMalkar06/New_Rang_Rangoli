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

  useEffect(() => {
    if (currentUser) {
      navigate('/shop');
    }
  }, [currentUser, navigate]);

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

      </div>
    </div>
  );
};

export default WholesalePage;
