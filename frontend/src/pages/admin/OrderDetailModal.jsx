import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  Check,
  Truck,
  CreditCard,
  Calendar,
  Printer,
  AlertCircle,
  Clock,
  ShieldCheck,
  Key,
  Send,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Copy,
  ExternalLink,
  Link2
} from 'lucide-react';

const FULFILLMENT_OPTIONS = [
  'Processing',
  'Shipped',
  'Out for Delivery',
  'Ready-for-Pickup',
  'Delivered',
  'Cancelled'
];

const PAYMENT_OPTIONS = ['Pending', 'Paid', 'Failed'];

const BUSINESS_WHATSAPP_PHONE = '+91 70576 17451';
const OWNER_NAME = 'Kishor Jamdade';

const OrderDetailModal = ({ order, isOpen, onClose, onUpdated, token }) => {
  if (!isOpen || !order) return null;

  const [currentOrder, setCurrentOrder] = useState(order);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus || 'Processing');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'Pending');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Delivery OTP states
  const [deliveryOtpInput, setDeliveryOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState(null);
  const [markPaymentPaid, setMarkPaymentPaid] = useState(currentOrder.paymentStatus !== 'Paid');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showEmergencyOverride, setShowEmergencyOverride] = useState(false);

  // Delivery Boy Verification Portal URL
  const deliveryPortalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/delivery-verify/${currentOrder._id}`
    : `/delivery-verify/${currentOrder._id}`;

  const handleCopyDeliveryLink = () => {
    try {
      navigator.clipboard.writeText(deliveryPortalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy delivery link:', e);
    }
  };

  // Format recipient phone for WhatsApp Web
  const cleanedPhone = (currentOrder.customerPhone || '').replace(/\D/g, '');
  const waRecipientNumber = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
  const waChatUrl = `https://wa.me/${waRecipientNumber}?text=${encodeURIComponent(
    `Namaste ${currentOrder.customerName}, this is regarding your New Rang Rangoli Order #${currentOrder._id.slice(-6).toUpperCase()}. Helpline: ${BUSINESS_WHATSAPP_PHONE}`
  )}`;

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      setFeedback(null);

      // Check if user is attempting to mark as Delivered without verifying OTP
      if (fulfillmentStatus === 'Delivered' && !currentOrder.deliveryOtp?.isVerified) {
        throw new Error(
          'Customer OTP verification is compulsory! Please enter the 4-digit OTP in the Delivery Verification section below to confirm delivery.'
        );
      }

      const res = await fetch(`/api/orders/${currentOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fulfillmentStatus, paymentStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }

      setCurrentOrder(data.data);
      setFeedback({ type: 'success', message: 'Order status updated & customer notified on WhatsApp!' });
      onUpdated(data.data);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating order' });
    } finally {
      setUpdating(false);
    }
  };

  // Send or Resend Delivery OTP via WhatsApp
  const handleSendDeliveryOtp = async () => {
    try {
      setSendingOtp(true);
      setOtpFeedback(null);

      const res = await fetch(`/api/orders/${currentOrder._id}/send-delivery-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send Delivery OTP');
      }

      setCurrentOrder(data.data);
      setFulfillmentStatus('Out for Delivery');
      setOtpFeedback({
        type: 'success',
        message: `4-Digit OTP (${data.data?.deliveryOtp?.code}) sent to customer WhatsApp (+${currentOrder.customerPhone}) from ${OWNER_NAME} (${BUSINESS_WHATSAPP_PHONE})!`
      });
      onUpdated(data.data);
      setTimeout(() => setOtpFeedback(null), 6000);
    } catch (err) {
      setOtpFeedback({ type: 'error', message: err.message || 'Error sending OTP' });
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Delivery OTP entered by delivery person
  const handleVerifyDeliveryOtp = async () => {
    if (!deliveryOtpInput || deliveryOtpInput.trim().length !== 4) {
      setOtpFeedback({ type: 'error', message: 'Please enter the exact 4-digit OTP provided by customer.' });
      return;
    }

    try {
      setVerifyingOtp(true);
      setOtpFeedback(null);

      const res = await fetch(`/api/orders/${currentOrder._id}/verify-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          otp: deliveryOtpInput.trim(),
          markPaymentPaid
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'OTP verification failed');
      }

      setCurrentOrder(data.data);
      setFulfillmentStatus('Delivered');
      if (markPaymentPaid) {
        setPaymentStatus('Paid');
      }
      setDeliveryOtpInput('');
      setOtpFeedback({
        type: 'success',
        message: 'Delivery confirmed & verified! Customer notified on WhatsApp.'
      });
      onUpdated(data.data);
      setTimeout(() => setOtpFeedback(null), 6000);
    } catch (err) {
      setOtpFeedback({ type: 'error', message: err.message || 'Verification error' });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const getFulfillmentBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Out for Delivery':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Ready-for-Pickup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Processing':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  const getPaymentBadgeClass = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Failed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Pending':
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  // Calculate items subtotal and delivery charge
  const itemsSubtotal = (currentOrder.items || []).reduce((sum, item) => {
    const p = item.priceAtPurchase != null ? item.priceAtPurchase : 0;
    const q = item.quantity != null ? item.quantity : 1;
    return sum + p * q;
  }, 0);

  const deliveryCharges = Math.max(0, (currentOrder.totalPrice || 0) - itemsSubtotal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-outfit">
                  Order #{currentOrder._id.slice(-8).toUpperCase()}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getFulfillmentBadgeClass(
                    currentOrder.fulfillmentStatus
                  )}`}
                >
                  {currentOrder.fulfillmentStatus}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadgeClass(
                    currentOrder.paymentStatus
                  )}`}
                >
                  {currentOrder.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Placed on{' '}
                {new Date(currentOrder.createdAt).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="Print Order Summary / Invoice"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* STATUS CONTROL BAR */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-orange-200/60 dark:border-slate-800 px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                  Fulfillment Status
                </span>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="rounded-xl border border-orange-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                  Payment Status
                </span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="rounded-xl border border-orange-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {PAYMENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleStatusUpdate}
              disabled={updating}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {updating ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Update Status & Notify WhatsApp</span>
            </button>
          </div>

          {/* Dynamic Automation Indicator */}
          <div className="mt-2.5 text-[11px] text-orange-950/90 dark:text-orange-200/90 font-semibold flex items-center gap-1.5 bg-orange-100/70 dark:bg-orange-950/40 px-3 py-1.5 rounded-xl border border-orange-200/80 dark:border-orange-900/60">
            <span>⚡</span>
            <span>
              {fulfillmentStatus === 'Shipped'
                ? 'Automated WhatsApp Dispatch: System will automatically send "Parcel Dispatched" notification to customer.'
                : fulfillmentStatus === 'Out for Delivery'
                ? 'Automated WhatsApp OTP: System will automatically generate 4-digit OTP & send "Out for Delivery" notification to customer.'
                : fulfillmentStatus === 'Delivered'
                ? 'Delivery Verification: Verified by delivery partner via Doorstep Verification portal at customer doorstep.'
                : 'Status updates automatically notify customer on WhatsApp.'}
            </span>
          </div>

          {feedback && (
            <div
              className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span className="font-semibold">{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* COMPULSORY DELIVERY OTP VERIFICATION PANEL */}
          <div className="rounded-3xl border-2 border-orange-400/80 dark:border-orange-500/80 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white dark:from-slate-900 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Compulsory WhatsApp Delivery OTP</span>
                    {currentOrder.deliveryOtp?.isVerified ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold uppercase">
                        Pending Handover
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Delivery agent must collect & enter customer OTP to confirm parcel receipt.
                  </p>
                </div>
              </div>

              {/* Direct WhatsApp Action for Shop / Delivery Agent */}
              <a
                href={waChatUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                title={`Open WhatsApp chat using business helpline ${BUSINESS_WHATSAPP_PHONE}`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {currentOrder.deliveryOtp?.isVerified ? (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                    Parcel Delivered & 4-Digit OTP Verified Successfully!
                  </p>
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-400">
                    Verified OTP Code: <strong className="font-mono">{currentOrder.deliveryOtp?.code}</strong>
                    {currentOrder.deliveryOtp?.verifiedAt && (
                      <span>
                        {' '}• at {new Date(currentOrder.deliveryOtp.verifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1">
                    Customer received final delivery confirmation on WhatsApp from {OWNER_NAME} ({BUSINESS_WHATSAPP_PHONE}).
                  </p>
                </div>
              </div>
            ) : (() => {
              const isOtpExpired = currentOrder.deliveryOtp?.expiresAt && new Date() > new Date(currentOrder.deliveryOtp.expiresAt);
              const attemptsCount = currentOrder.deliveryOtp?.attempts || 0;
              const maxAttempts = currentOrder.deliveryOtp?.maxAttempts || 5;
              const isMaxAttempts = attemptsCount >= maxAttempts;
              const formattedExpiry = currentOrder.deliveryOtp?.expiresAt 
                ? new Date(currentOrder.deliveryOtp.expiresAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                : null;

              return (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Active OTP:</span>
                      {currentOrder.deliveryOtp?.code ? (
                        <span className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 font-mono font-black text-orange-700 dark:text-orange-300 tracking-wider">
                          {currentOrder.deliveryOtp.code}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Auto-generated upon order</span>
                      )}

                      {/* Expiration Badge */}
                      {formattedExpiry && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOtpExpired 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {isOtpExpired ? 'Expired' : `Expires: ${formattedExpiry}`}
                        </span>
                      )}

                      {/* Attempt Count Badge */}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isMaxAttempts 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : attemptsCount > 0 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        Attempts: {attemptsCount}/{maxAttempts}
                      </span>
                    </div>

                    <button
                      onClick={handleSendDeliveryOtp}
                      disabled={sendingOtp}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {sendingOtp ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {currentOrder.deliveryOtp?.code ? 'Resend 4-Digit OTP' : 'Send 4-Digit OTP'}
                      </span>
                    </button>
                  </div>

                  {/* Warning if locked or expired */}
                  {isMaxAttempts && (
                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                      ⚠️ Maximum 5 verification attempts exceeded. Please click <strong>"Resend 4-Digit OTP"</strong> above to issue a new code.
                    </div>
                  )}

                  {isOtpExpired && !isMaxAttempts && (
                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                      ⏳ This OTP has expired after 24 hours. Please click <strong>"Resend 4-Digit OTP"</strong> to issue a fresh code.
                    </div>
                  )}

                  {/* Doorstep Delivery Boy Portal Card */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <span className="text-xs font-black text-indigo-900 dark:text-indigo-200">
                          Doorstep Delivery Partner Portal
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold">
                          Doorstep Verification
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Admin does not enter OTP
                      </span>
                    </div>

                    <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                      Share this portal link with your delivery partner. The delivery boy will open this link on their mobile phone, inspect the items, collect the COD amount (₹{currentOrder.totalPrice}), and enter the customer's 4-digit OTP at doorstep.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-hidden">
                        <Link2 className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                        <span className="truncate">{deliveryPortalUrl}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyDeliveryLink}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>{copiedLink ? 'Copied Link!' : 'Copy Link for Delivery Boy'}</span>
                        </button>
                        <a
                          href={deliveryPortalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-xs font-bold transition-all cursor-pointer"
                          title="Open delivery verification screen"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open</span>
                        </a>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>🔔</span>
                      <span>
                        Automatic Alert: Store owner <strong>{OWNER_NAME} ({BUSINESS_WHATSAPP_PHONE})</strong> will receive an instant WhatsApp alert immediately once the delivery boy completes verification.
                      </span>
                    </div>
                  </div>

                  {/* Optional Admin Emergency Override Toggle */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowEmergencyOverride(!showEmergencyOverride)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 underline cursor-pointer"
                    >
                      {showEmergencyOverride ? '▲ Hide Emergency Admin Verification' : '▼ Need to verify manually? (Emergency Admin Override)'}
                    </button>

                    {showEmergencyOverride && (
                      <div className="mt-3 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-2.5">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          Emergency Admin Override: Enter 4-Digit OTP directly:
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="e.g. 4829"
                            value={deliveryOtpInput}
                            onChange={(e) => setDeliveryOtpInput(e.target.value.replace(/\D/g, ''))}
                            disabled={isMaxAttempts || isOtpExpired}
                            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-mono font-bold tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                          />

                          <button
                            onClick={handleVerifyDeliveryOtp}
                            disabled={verifyingOtp || deliveryOtpInput.length !== 4 || isMaxAttempts || isOtpExpired}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md disabled:opacity-40 transition-all cursor-pointer"
                          >
                            {verifyingOtp ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                            <span>Emergency Confirm</span>
                          </button>
                        </div>

                        {currentOrder.paymentStatus !== 'Paid' && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="markPaidCheckbox"
                              checked={markPaymentPaid}
                              onChange={(e) => setMarkPaymentPaid(e.target.checked)}
                              className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                            />
                            <label htmlFor="markPaidCheckbox" className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                              Collect payment (₹{currentOrder.totalPrice}) and automatically mark payment as <strong>Paid</strong> upon OTP verification
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {otpFeedback && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        otpFeedback.type === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {otpFeedback.type === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      )}
                      <span className="font-semibold">{otpFeedback.message}</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Customer & Shipping Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-orange-500" />
                Customer Contact Details
              </h5>
              <p className="text-sm font-black text-slate-900 dark:text-white">{currentOrder.customerName}</p>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a
                    href={`mailto:${currentOrder.customerEmail}`}
                    className="hover:underline text-orange-600 dark:text-orange-400 font-medium"
                  >
                    {currentOrder.customerEmail}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <a
                    href={`tel:${currentOrder.customerPhone}`}
                    className="hover:underline font-mono font-bold text-slate-800 dark:text-slate-200"
                  >
                    {currentOrder.customerPhone}
                  </a>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                Delivery Destination
              </h5>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                {currentOrder.shippingAddress || 'No address provided'}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
                <span>
                  Payment:{' '}
                  <strong className="text-slate-700 dark:text-slate-300">
                    {currentOrder.paymentMethod || 'COD'}
                  </strong>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${
                    currentOrder.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentOrder.paymentStatus === 'Paid' ? 'Paid' : 'Pay on Delivery'}
                </span>
                {currentOrder.transactionId && (
                  <span className="w-full font-mono text-[10px] text-slate-400 mt-0.5">
                    TXN: {currentOrder.transactionId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-amber-500" />
                Order Line Items ({currentOrder.items?.length || 0})
              </h5>
              <span className="text-xs font-bold text-slate-500">Items Subtotal: ₹{itemsSubtotal}</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Packet Weight</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentOrder.items?.map((item, idx) => {
                    const price = item.priceAtPurchase != null ? item.priceAtPurchase : 0;
                    const qty = item.quantity != null ? item.quantity : 1;
                    const lineSubtotal = price * qty;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                              <img
                                src={item.image || '/colors/shade-card.jpg'}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/colors/shade-card.jpg';
                                }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                              {item.nameMR && <p className="text-[10px] text-slate-400">{item.nameMR}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-lg bg-orange-100/60 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold text-[11px]">
                            {item.selectedWeight || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                          ₹{price}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {qty}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                          ₹{lineSubtotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-950/60 text-xs border-t border-slate-200 dark:border-slate-800">
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-right text-slate-500 font-semibold">
                      Items Subtotal:
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                      ₹{itemsSubtotal}
                    </td>
                  </tr>
                  {deliveryCharges > 0 && (
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-slate-500 font-semibold">
                        Shipping & Doorstep Delivery Charges:
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                        ₹{deliveryCharges}
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-200 dark:border-slate-800 bg-orange-50/40 dark:bg-orange-950/20 font-black">
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-900 dark:text-white text-sm">
                      Total Order Amount:
                    </td>
                    <td className="py-3 px-3 text-right text-base text-orange-600 dark:text-orange-400">
                      ₹{currentOrder.totalPrice}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* WhatsApp Notification Logs */}
          {currentOrder.whatsappLogs && currentOrder.whatsappLogs.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-950/40">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-500" />
                WhatsApp Message History ({currentOrder.whatsappLogs.length})
              </h5>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {currentOrder.whatsappLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[9px]">
                        {log.type}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                        {log.message}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(log.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-[11px] text-slate-400">
            Order Reference ID: <span className="font-mono">{currentOrder._id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
