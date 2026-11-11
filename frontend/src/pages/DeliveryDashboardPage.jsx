import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { selectUser, selectToken } from '../store/authSlice';
import {
  Truck,
  Package,
  Phone,
  MapPin,
  CheckCircle2,
  Navigation,
  Search,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Key,
  ShieldCheck,
  AlertCircle,
  Clock,
  Check,
  UserCheck
} from 'lucide-react';

const OWNER_NAME = 'Kishor Jamdade';
const OWNER_PHONE = '+91 70576 17451';

const DeliveryDashboardPage = () => {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState('active'); // 'active', 'shipped', 'out', 'delivered', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Per-order OTP inputs & loading states
  const [otpInputs, setOtpInputs] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [actionFeedback, setActionFeedback] = useState({});

  useEffect(() => {
    // Redirect non-delivery users to login
    if (!user) {
      navigate('/login?redirect=/delivery-dashboard');
      return;
    }
    if (user.role !== 'delivery' && user.role !== 'admin') {
      navigate('/account');
      return;
    }

    fetchDeliveryRuns();
  }, [user, navigate]);

  const fetchDeliveryRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders/delivery/runs', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load delivery runs');
      }
      setOrders(data.data || []);
    } catch (err) {
      setError(err.message || 'Could not connect to delivery service');
    } finally {
      setLoading(false);
    }
  };

  // Delivery partner marks order as "Out for Delivery"
  const handleStartDelivery = async (orderId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: true }));
      setActionFeedback((prev) => ({ ...prev, [orderId]: null }));

      const res = await fetch(`/api/orders/${orderId}/start-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to mark out for delivery');
      }

      // Update state with updated order
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      setActionFeedback((prev) => ({
        ...prev,
        [orderId]: {
          type: 'success',
          message: 'Order is now Out for Delivery! 4-Digit OTP sent automatically to customer WhatsApp.'
        }
      }));
    } catch (err) {
      setActionFeedback((prev) => ({
        ...prev,
        [orderId]: { type: 'error', message: err.message || 'Error starting delivery run' }
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Delivery partner enters & verifies 4-digit OTP at doorstep
  const handleVerifyOtp = async (orderId) => {
    const enteredOtp = (otpInputs[orderId] || '').trim();
    if (!enteredOtp || enteredOtp.length !== 4) {
      setActionFeedback((prev) => ({
        ...prev,
        [orderId]: { type: 'error', message: 'Please enter the complete 4-digit OTP from customer.' }
      }));
      return;
    }

    try {
      setActionLoading((prev) => ({ ...prev, [orderId]: true }));
      setActionFeedback((prev) => ({ ...prev, [orderId]: null }));

      const res = await fetch(`/api/orders/${orderId}/delivery-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ otp: enteredOtp, markPaymentPaid: true })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      setOtpInputs((prev) => ({ ...prev, [orderId]: '' }));
      setActionFeedback((prev) => ({
        ...prev,
        [orderId]: {
          type: 'success',
          message: `Delivery successfully confirmed with OTP! Payment marked as Paid and Admin ${OWNER_NAME} (${OWNER_PHONE}) notified.`
        }
      }));
    } catch (err) {
      setActionFeedback((prev) => ({
        ...prev,
        [orderId]: { type: 'error', message: err.message || 'Verification failed' }
      }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (!user) return null;

  // Filter & Search Logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery.trim() ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone || '').includes(searchQuery) ||
      (order.shippingAddress || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'active') {
      return order.fulfillmentStatus === 'Shipped' || order.fulfillmentStatus === 'Out for Delivery';
    }
    if (filterTab === 'shipped') return order.fulfillmentStatus === 'Shipped';
    if (filterTab === 'out') return order.fulfillmentStatus === 'Out for Delivery';
    if (filterTab === 'delivered') return order.fulfillmentStatus === 'Delivered';
    return true;
  });

  const countShipped = orders.filter((o) => o.fulfillmentStatus === 'Shipped').length;
  const countOut = orders.filter((o) => o.fulfillmentStatus === 'Out for Delivery').length;
  const countDelivered = orders.filter((o) => o.fulfillmentStatus === 'Delivered').length;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Delivery Partner Top Bar */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-2xl"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-lg text-2xl font-black">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-outfit">
                    Delivery Partner Portal
                  </h1>
                  <span className="rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                    Live Runs
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Logged in as <strong>{user.name}</strong> ({user.phone || user.email}) • New Rang Rangoli
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={fetchDeliveryRuns}
                disabled={loading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                title="Refresh delivery list"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setFilterTab('shipped')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                filterTab === 'shipped'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                1. Ready Dispatched
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-outfit mt-0.5 block">
                {countShipped}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('out')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                filterTab === 'out'
                  ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                2. Out for Delivery
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-outfit mt-0.5 block">
                {countOut}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('delivered')}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                filterTab === 'delivered'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-100/50'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                3. Delivered Today
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-outfit mt-0.5 block">
                {countDelivered}
              </span>
            </button>
          </div>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setFilterTab('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Active Runs ({countShipped + countOut})
            </button>
            <button
              onClick={() => setFilterTab('shipped')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'shipped'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dispatched ({countShipped})
            </button>
            <button
              onClick={() => setFilterTab('out')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'out'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Out for Delivery ({countOut})
            </button>
            <button
              onClick={() => setFilterTab('delivered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'delivered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Delivered ({countDelivered})
            </button>
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({orders.length})
            </button>
          </div>

          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID, customer, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Orders List Container */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-3" />
            <p className="text-xs text-slate-500 font-semibold">Loading delivery orders...</p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/40 p-8 text-center text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-bold">{error}</p>
            <button
              onClick={fetchDeliveryRuns}
              className="mt-3 px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-2xl">
              📦
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No orders found in this filter
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              When the workshop admin marks an order as "Shipped" / "Parcel Dispatched", it will immediately appear here for your delivery run.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isShipped = order.fulfillmentStatus === 'Shipped';
              const isOut = order.fulfillmentStatus === 'Out for Delivery';
              const isDelivered = order.fulfillmentStatus === 'Delivered';

              const cleanPhone = (order.customerPhone || '').replace(/\D/g, '');
              const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                order.shippingAddress || ''
              )}`;

              const feedback = actionFeedback[order._id];
              const isActionRunning = actionLoading[order._id];

              return (
                <div
                  key={order._id}
                  className={`rounded-3xl border transition-all p-5 sm:p-6 bg-white dark:bg-slate-900 shadow-md ${
                    isOut
                      ? 'border-amber-400 dark:border-amber-500/80 shadow-amber-500/5 ring-2 ring-amber-400/20'
                      : isShipped
                      ? 'border-blue-300 dark:border-blue-700/80'
                      : 'border-slate-200 dark:border-slate-800 opacity-90'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                          Order #{order._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                              : isOut
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 animate-pulse'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                          }`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • Updated {new Date(order.updatedAt || order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Amount & Payment Status */}
                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Payment & Collect
                      </span>
                      <div className="flex items-baseline sm:justify-end gap-1.5">
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-outfit">
                          ₹{order.totalPrice?.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 font-bold'
                          }`}
                        >
                          {order.paymentStatus === 'Paid' ? 'Paid Online' : 'Collect COD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 text-xs">
                    {/* Recipient Contact */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Customer Recipient
                      </span>
                      <p className="font-black text-sm text-slate-900 dark:text-white">
                        {order.customerName}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-all shadow-2xs"
                        >
                          <Phone className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{order.customerPhone}</span>
                        </a>

                        <a
                          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                            `Namaste ${order.customerName}, this is your delivery partner for New Rang Rangoli Order #${order._id.slice(-6).toUpperCase()}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Delivery Destination */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Detail Delivery Address
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                        {order.shippingAddress}
                      </p>

                      <div className="pt-1">
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-bold transition-all"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Open in Google Maps</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Items Preview */}
                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 pb-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Parcel Contents ({order.items?.length || 0} items)
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1.5 text-xs">
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            • <strong>{item.quantity}x</strong> {item.name}{' '}
                            {item.selectedWeight && <span className="text-orange-500 font-semibold">({item.selectedWeight})</span>}
                          </span>
                          <span className="text-slate-500 font-mono">
                            ₹{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Banner */}
                  {feedback && (
                    <div
                      className={`my-3 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                        feedback.type === 'success'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                      <span className="font-bold">{feedback.message}</span>
                    </div>
                  )}

                  {/* ACTION BAR BASED ON ORDER STAGE */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Stage 1: Shipped / Dispatched -> Delivery Boy starts run */}
                    {isShipped && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600 shrink-0" />
                          <p className="text-xs text-blue-950 dark:text-blue-200 font-medium">
                            Order is packed and ready. Start run to send 4-digit OTP to customer.
                          </p>
                        </div>

                        <button
                          onClick={() => handleStartDelivery(order._id)}
                          disabled={isActionRunning}
                          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          {isActionRunning ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Navigation className="h-4 w-4" />
                          )}
                          <span>Start Delivery Run (Mark Out for Delivery)</span>
                        </button>
                      </div>
                    )}

                    {/* Stage 2: Out for Delivery -> Delivery Boy inputs customer OTP */}
                    {isOut && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/20 border-2 border-amber-400 dark:border-amber-600 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="text-xs font-black text-amber-950 dark:text-amber-200">
                              Doorstep 4-Digit OTP Verification
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">
                            Collect ₹{order.totalPrice?.toFixed(2)} if COD
                          </span>
                        </div>

                        <p className="text-[11px] text-amber-900/80 dark:text-amber-300">
                          Inspect items with customer, collect cash if COD, and ask customer for the 4-digit OTP they received on WhatsApp (+{order.customerPhone}).
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-Digit OTP"
                            value={otpInputs[order._id] || ''}
                            onChange={(e) =>
                              setOtpInputs((prev) => ({
                                ...prev,
                                [order._id]: e.target.value.replace(/\D/g, '')
                              }))
                            }
                            className="flex-1 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-mono font-black tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                          />

                          <button
                            onClick={() => handleVerifyOtp(order._id)}
                            disabled={isActionRunning || (otpInputs[order._id] || '').length !== 4}
                            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {isActionRunning ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            <span>Verify OTP & Mark Delivered</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Stage 3: Delivered -> Confirmed */}
                    {isDelivered && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="font-bold">
                            Successfully Delivered & Verified with OTP ({order.deliveryOtp?.code})
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                          🔔 Admin {OWNER_NAME} notified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryDashboardPage;
