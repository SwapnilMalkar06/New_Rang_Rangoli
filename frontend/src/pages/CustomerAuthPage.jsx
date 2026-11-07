import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { loginUser, registerUser, selectAuthLoading, selectAuthError, selectUser, clearError } from '../store/authSlice';
import { User, Mail, Lock, Phone, Eye, EyeOff, Sparkles, ShoppingBag, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const CustomerAuthPage = ({ defaultTab = 'login' }) => {
  const { t, language } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);
  const currentUser = useSelector(selectUser);

  const redirectUrl = searchParams.get('redirect') || '/shop';
  const queryMode = searchParams.get('mode');

  const [activeTab, setActiveTab] = useState(queryMode === 'register' ? 'register' : defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Form Fields - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields - Register
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  useEffect(() => {
    dispatch(clearError());
    setValidationError('');
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' && redirectUrl === '/shop') {
        navigate('/admin');
      } else {
        navigate(redirectUrl);
      }
    }
  }, [currentUser, navigate, redirectUrl]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!loginEmail || !loginPassword) {
      setValidationError('Please fill in both email and password.');
      return;
    }
    dispatch(loginUser({ email: loginEmail, password: loginPassword }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!regName.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 10) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regEmail.trim()) {
      setValidationError('Email address is required.');
      return;
    }
    if (regPassword.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    dispatch(
      registerUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        password: regPassword,
        role: 'customer'
      })
    );
  };

  const handleQuickDemoLogin = () => {
    setLoginEmail('radha@example.com');
    setLoginPassword('password123');
    dispatch(loginUser({ email: 'radha@example.com', password: 'password123' }));
  };

  const handleQuickAdminLogin = () => {
    setLoginEmail('admin@newrangrangoli.com');
    setLoginPassword('admin123');
    dispatch(loginUser({ email: 'admin@newrangrangoli.com', password: 'admin123' }));
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50/50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-md">
        
        {/* Brand / Festive Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 text-white shadow-xl shadow-orange-500/20 mb-4 animate-pulse">
            <span className="text-3xl">🌸</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 dark:from-orange-400 dark:via-rose-400 dark:to-amber-400 bg-clip-text text-transparent font-outfit">
            {activeTab === 'login' ? t('customerLoginTitle') : t('customerRegisterTitle')}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
            {activeTab === 'login' ? t('customerLoginSubtitle') : t('customerRegisterSubtitle')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
          
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('signInTab')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                activeTab === 'register'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('registerTab')}
            </button>
          </div>

          {/* Error Message */}
          {(authError || validationError) && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{validationError || authError}</span>
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('customerEmailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    placeholder="e.g. radha@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('customerPasswordLabel')}
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                  <span>{t('rememberMe')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>{t('btnCustomerLogin')}</span>
                  </>
                )}
              </button>

              {/* Quick Demo Login Helper */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-orange-300 dark:border-orange-900/60 bg-orange-50/60 dark:bg-orange-950/20 py-2 text-xs font-semibold text-orange-700 dark:text-orange-300 hover:bg-orange-100/70 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  <span>Demo Customer</span>
                </button>
                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100/70 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Demo Admin</span>
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('customerNameLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Priya Patil"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('customerPhoneLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('customerEmailLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="e.g. priya@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('customerPasswordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('confirmPasswordLabel')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t('btnCustomerRegister')}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch Prompt */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800 text-center">
            {activeTab === 'login' ? (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('dontHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {t('signUpNow')}
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                >
                  {t('signInNow')}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Wholesale Switch Banner */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-4 text-center backdrop-blur-md">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">
            {t('wholesaleSwitchNotice')}
          </p>
          <Link
            to="/wholesale"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>{t('goToWholesaleLink')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CustomerAuthPage;
