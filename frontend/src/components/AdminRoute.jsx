import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { selectUser, selectToken, loginUser } from '../store/authSlice';
import { ShieldAlert, ArrowLeft, LogIn, Sparkles } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  if (!token || !user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mb-5">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-outfit mb-2">
            Administrator Privileges Required
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
            You are signed in as <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong> with role <span className="uppercase text-orange-500 font-bold">{user.role}</span>. This portal is restricted to authorized store administrators.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                dispatch(loginUser({ email: 'admin@newrangrangoli.com', password: 'admin123' }));
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-3 text-xs font-bold text-white shadow-md hover:from-orange-600 hover:to-rose-700 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Switch to Demo Admin (admin@newrangrangoli.com)</span>
            </button>

            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
