import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { selectUser, selectToken, logout } from '../store/authSlice';
import { User, Package, LogOut, ShoppingBag, Calendar, MapPin, CheckCircle, Clock, Truck, ChevronRight, ShieldCheck } from 'lucide-react';
import OrderTrackingBar from '../components/OrderTrackingBar';

const CustomerAccountPage = () => {
  const { t, language } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/account');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        const res = await fetch('/api/orders/my-orders', {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        } else {
          setErrorOrders(data.message || 'Could not fetch order history.');
        }
      } catch (err) {
        setErrorOrders(err.message || 'Failed to connect to order service.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user, token, navigate]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl">

        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xl mb-8">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-gradient-to-br from-orange-500/10 to-rose-500/10 blur-2xl"></div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-600 text-3xl font-extrabold text-white shadow-lg shadow-orange-500/25">
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit">
                    {user.name}
                  </h1>
                  <span className="rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 px-2.5 py-0.5 text-[11px] font-extrabold uppercase">
                    {user.role === 'delivery' ? 'Delivery Partner' : user.role === 'retailer' ? 'Wholesale Partner' : 'Shopping Customer'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {user.email} • {user.phone || 'Phone registered'}
                </p>
                {user.businessName && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                    Business: {user.businessName} {user.gstin && `(GSTIN: ${user.gstin})`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
              {(user.role === 'delivery' || user.role === 'admin') && (
                <Link
                  to="/delivery-dashboard"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
                >
                  <Truck className="h-4 w-4" />
                  <span>Delivery Runs</span>
                </Link>
              )}
              <Link
                to="/shop"
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Shop Colors</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('navLogout')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              <span>{t('myOrdersTitle')}</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </span>
          </div>

          {loadingOrders ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mb-3" />
              <p className="text-xs text-slate-500">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-10 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-2xl">
                🌸
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                {t('noOrdersFound')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                Explore our authentic 23-shade regular rangoli and 15-shade Sanskar Bharati velvety color collections!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-xl transition-all"
              >
                <span>{t('startShopping')}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                });

                const isDelivered = order.fulfillmentStatus === 'Delivered';
                const isOutForDelivery = order.fulfillmentStatus === 'Out for Delivery';
                const isShipped = order.fulfillmentStatus === 'Shipped';
                const isProcessing = order.fulfillmentStatus === 'Processing';

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              isDelivered
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : isOutForDelivery
                                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-800 animate-pulse'
                                : isShipped
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                                : isProcessing
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {order.fulfillmentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>Placed on {dateStr}</span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-400 block">{t('orderTotal')}</span>
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          ₹{(order.totalPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* 4-Stage Live Parcel Progress Bar */}
                    <div className="my-4">
                      <OrderTrackingBar
                        fulfillmentStatus={order.fulfillmentStatus}
                        deliveryOtp={order.deliveryOtp}
                        createdAt={order.createdAt}
                        updatedAt={order.updatedAt}
                      />
                    </div>

                    {/* Delivery OTP WhatsApp Notice if Out for Delivery */}
                    {isOutForDelivery && (
                      <div className="my-3 p-3 rounded-2xl bg-cyan-50/90 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 text-xs flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">🚚</span>
                        <div>
                          <p className="font-extrabold text-cyan-900 dark:text-cyan-200">
                            Your package is Out for Delivery Today!
                          </p>
                          <p className="text-[11px] text-cyan-800 dark:text-cyan-300 mt-0.5 leading-relaxed">
                            A 4-digit Delivery Verification OTP was automatically sent to your WhatsApp (<strong>{order.customerPhone}</strong>). Please share this OTP with your delivery partner <strong>ONLY after inspecting and receiving your parcel at doorstep</strong>.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Verified Delivery Badge */}
                    {isDelivered && order.deliveryOtp?.isVerified && (
                      <div className="my-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Delivered & verified with your WhatsApp OTP. Thank you for celebrating with us!</span>
                      </div>
                    )}

                    {/* Order Items list */}
                    <div className="pt-3 space-y-2">
                      {order.items?.map((item, idx) => {
                        const product = item.product || {};
                        const name = (language === 'mr' && (product.nameMR || item.nameMR)) 
                          ? (product.nameMR || item.nameMR) 
                          : (product.name || item.name || 'Rangoli Item');
                        const image = (product.imageUrls && product.imageUrls[0]) || item.image || '/festivals/diwali.png';

                        return (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-3">
                              <img
                                src={image}
                                alt={name}
                                className="h-10 w-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
                              />
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  {name} {item.selectedWeight && <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold">({item.selectedWeight})</span>}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Qty: {item.quantity} × ₹{item.priceAtPurchase || 0}
                                </span>
                              </div>
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              ₹{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping Address note & WhatsApp Helpline */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                      {order.shippingAddress && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="line-clamp-1">{order.shippingAddress}</span>
                        </div>
                      )}

                      <a
                        href={`https://wa.me/917057617451?text=${encodeURIComponent(`Hello New Rang Rangoli, I have a query about my order #${order._id.slice(-6).toUpperCase()}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline shrink-0"
                      >
                        <span>💬 WhatsApp Helpline (+91 70576 17451)</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerAccountPage;
