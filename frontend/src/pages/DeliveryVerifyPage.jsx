import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Phone, MapPin, DollarSign, Key, ShieldCheck, ArrowRight, Truck } from 'lucide-react';

const OWNER_PHONE = '+91 70576 17451';
const OWNER_NAME = 'Kishor Jamdade';

const DeliveryVerifyPage = () => {
  const { id: paramId } = useParams();
  const [orderId, setOrderId] = useState(paramId || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(paramId));
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Fetch order details
  useEffect(() => {
    if (paramId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/orders/${paramId}`);
          const data = await res.json();
          if (res.ok && data.success) {
            setOrder(data.data);
            if (data.data.fulfillmentStatus === 'Delivered' && data.data.deliveryOtp?.isVerified) {
              setVerifiedSuccess(true);
            }
          } else {
            setFeedback({ type: 'error', message: data.message || 'Order not found' });
          }
        } catch (err) {
          setFeedback({ type: 'error', message: 'Failed to load order: ' + err.message });
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [paramId]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    try {
      setLoading(true);
      setFeedback(null);
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder(data.data);
        if (data.data.fulfillmentStatus === 'Delivered' && data.data.deliveryOtp?.isVerified) {
          setVerifiedSuccess(true);
        }
      } else {
        setFeedback({ type: 'error', message: data.message || 'Order not found' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      setFeedback({ type: 'error', message: 'Please enter the exact 4-digit OTP provided by the customer.' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedback(null);

      const targetId = order?._id || orderId;
      const res = await fetch(`/api/orders/${targetId}/delivery-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otp.trim(),
          markPaymentPaid: true
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifiedSuccess(true);
        setOrder(data.data);
        setFeedback({
          type: 'success',
          message: 'Delivery Verified! Customer & Admin (Kishor Jamdade) notified on WhatsApp.'
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.message || 'Incorrect OTP or expired. Please check with customer.'
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6">
      <div className="mx-auto max-w-lg space-y-5">
        
        {/* Header Bar */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
            <Truck className="h-3.5 w-3.5" />
            <span>Delivery Partner Handover Portal</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white font-outfit">
            New Rang Rangoli Doorstep Verification
          </h1>
          <p className="text-xs text-slate-500">
            Collect payment & verify 4-digit customer OTP to complete parcel handover
          </p>
        </div>

        {/* Search by Order ID if not in URL */}
        {!paramId && !order && (
          <form onSubmit={handleLookup} className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-lg space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Enter Order ID (from invoice/parcel label):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 6730..."
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Find Order'}
              </button>
            </div>
          </form>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Loading order details...</p>
          </div>
        )}

        {/* Order Details Card for Delivery Boy */}
        {order && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-5">
            
            {/* Top Status */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                <p className="font-mono text-sm font-black text-orange-600 dark:text-orange-400">
                  #{order._id.slice(-6).toUpperCase()}
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase ${
                verifiedSuccess || order.fulfillmentStatus === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {verifiedSuccess || order.fulfillmentStatus === 'Delivered' ? 'Delivered' : 'Out for Delivery'}
              </span>
            </div>

            {/* Customer & Address Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                  👤
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Customer</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{order.customerName}</p>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="inline-flex items-center gap-1 text-orange-600 font-bold mt-0.5 hover:underline"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call +{order.customerPhone}</span>
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Delivery Address</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Payment Box */}
              <div className={`p-4 rounded-2xl border ${
                order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && !verifiedSuccess
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      {order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && !verifiedSuccess
                        ? '💵 Cash to Collect at Doorstep'
                        : '✅ Payment Status'}
                    </span>
                    <p className="text-lg font-black font-outfit mt-0.5">
                      ₹{Number(order.totalPrice || 0).toFixed(2)}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/60 dark:bg-slate-900/60">
                    {verifiedSuccess ? 'Paid' : order.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* OTP VERIFICATION FORM */}
            {!verifiedSuccess ? (
              <form onSubmit={handleVerifyOtp} className="pt-2 space-y-4">
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Enter Customer's 4-Digit Delivery OTP:
                  </label>
                  <p className="text-[11px] text-slate-400">
                    (Customer received this 4-digit code on their WhatsApp)
                  </p>
                  
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="• • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-center text-3xl font-mono font-black tracking-[0.5em] py-3.5 rounded-2xl border-2 border-orange-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-4 focus:ring-orange-500/20"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.length !== 4}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  <span>Verify OTP & Confirm Handover</span>
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-2xl shadow-md">
                  ✓
                </div>
                <h3 className="text-base font-black text-emerald-900 dark:text-emerald-200">
                  Parcel Handover Verified & Completed!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  4-Digit OTP was verified successfully. The customer has received their delivery receipt, and store admin <strong>{OWNER_NAME}</strong> has been automatically notified on WhatsApp!
                </p>
              </div>
            )}

            {/* Feedback Alerts */}
            {feedback && (
              <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}>
                {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Owner Helpline */}
            <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
              Need help? Call workshop: <strong>{OWNER_NAME} ({OWNER_PHONE})</strong>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DeliveryVerifyPage;
