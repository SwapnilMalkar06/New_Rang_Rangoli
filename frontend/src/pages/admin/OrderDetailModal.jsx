import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Package, Check, Truck, CreditCard, Calendar, Printer, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

const FULFILLMENT_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Ready-for-Pickup'];
const PAYMENT_OPTIONS = ['Pending', 'Paid', 'Failed'];

const OrderDetailModal = ({ order, isOpen, onClose, onUpdated, token }) => {
  if (!isOpen || !order) return null;

  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillmentStatus || 'Processing');
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus || 'Pending');
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      setFeedback(null);

      const res = await fetch(`/api/orders/${order._id}/status`, {
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

      setFeedback({ type: 'success', message: 'Order status successfully updated!' });
      onUpdated(data.data);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Error updating order' });
    } finally {
      setUpdating(false);
    }
  };

  const getFulfillmentBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'Ready-for-Pickup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800';
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
  const itemsSubtotal = (order.items || []).reduce((sum, item) => {
    const p = item.priceAtPurchase != null ? item.priceAtPurchase : 0;
    const q = item.quantity != null ? item.quantity : 1;
    return sum + (p * q);
  }, 0);

  const deliveryCharges = Math.max(0, (order.totalPrice || 0) - itemsSubtotal);

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
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
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

        {/* FIXED STATUS CONTROL BAR (Never clipped, always visible) */}
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-orange-200/60 dark:border-slate-800 px-6 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                  Fulfillment
                </span>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="rounded-xl border border-orange-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {FULFILLMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                  Payment
                </span>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="rounded-xl border border-orange-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {PAYMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
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
              <span>Update Order Status</span>
            </button>
          </div>

          {feedback && (
            <div className={`mt-2 p-2 rounded-xl text-xs flex items-center gap-1.5 ${feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
              <Check className="h-3.5 w-3.5 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Customer & Shipping Information Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-orange-500" />
                Customer Contact Details
              </h5>
              <p className="text-sm font-black text-slate-900 dark:text-white">{order.customerName}</p>
              <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:underline text-orange-600 dark:text-orange-400 font-medium">
                    {order.customerEmail}
                  </a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono font-bold text-slate-800 dark:text-slate-200">
                    {order.customerPhone}
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
                {order.shippingAddress || 'No address provided'}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-1">
                <span>
                  Payment: <strong className="text-slate-700 dark:text-slate-300">{order.paymentMethod || 'COD'}</strong>
                </span>
                <span className={`px-2 py-0.5 rounded-md font-bold uppercase text-[9px] ${order.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {order.paymentStatus === 'Paid' ? 'Paid Online' : 'Pay on Delivery'}
                </span>
                {order.transactionId && (
                  <span className="w-full font-mono text-[10px] text-slate-400 mt-0.5">
                    TXN: {order.transactionId}
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
                Order Line Items ({order.items?.length || 0})
              </h5>
              <span className="text-xs font-bold text-slate-500">
                Items Subtotal: ₹{itemsSubtotal}
              </span>
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
                  {order.items?.map((item, idx) => {
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
                                onError={(e) => { e.target.src = '/colors/shade-card.jpg'; }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                              {item.nameMR && (
                                <p className="text-[10px] text-slate-400">{item.nameMR}</p>
                              )}
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
                      ₹{order.totalPrice}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="text-[11px] text-slate-400">
            Order Reference ID: <span className="font-mono">{order._id}</span>
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
