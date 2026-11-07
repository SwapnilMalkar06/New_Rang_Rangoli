import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Package, Check, Truck, CreditCard, Calendar, Printer, AlertCircle } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-outfit">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getFulfillmentBadgeClass(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus}
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
              title="Print Order Summary"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {feedback && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'}`}>
              <Check className="h-4 w-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Quick Status Control Bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Fulfillment & Payment Workflow
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fulfillment Status
                </label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {FULFILLMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {PAYMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {updating ? (
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                <span>Update Status</span>
              </button>
            </div>
          </div>

          {/* Customer & Shipping Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-orange-500" />
                Customer Details
              </h5>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{order.customerName}</p>
              <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`mailto:${order.customerEmail}`} className="hover:underline">{order.customerEmail}</a>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <a href={`tel:${order.customerPhone}`} className="hover:underline">{order.customerPhone}</a>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-rose-500" />
                Shipping Destination
              </h5>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {order.shippingAddress}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                Payment Method: <span className="font-bold text-slate-700 dark:text-slate-300">{order.paymentMethod || 'COD'}</span>
                {order.transactionId && (
                  <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                    TXN: {order.transactionId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-amber-500" />
              Order Items ({order.items?.length || 0})
            </h5>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Variant</th>
                    <th className="py-2.5 px-3 text-right">Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.items?.map((item, idx) => {
                    const itemSubtotal = (item.priceAtPurchase || 0) * (item.quantity || 1);
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'; }}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                              {item.nameMR && (
                                <p className="text-[10px] text-slate-400">{item.nameMR}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                          {item.selectedWeight || 'Standard'}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                          ₹{item.priceAtPurchase}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹{itemSubtotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-950/60 font-bold border-t border-slate-200 dark:border-slate-800">
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                      Grand Total Amount:
                    </td>
                    <td className="py-3 px-3 text-right text-base text-orange-600 dark:text-orange-400 font-black">
                      ₹{order.totalPrice}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
