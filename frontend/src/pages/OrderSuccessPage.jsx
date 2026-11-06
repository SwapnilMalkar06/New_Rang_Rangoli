import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle2, ShoppingBag, Truck, Calendar } from 'lucide-react';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to retrieve order receipt');
        }
        
        setOrder(data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center min-h-screen flex flex-col justify-center items-center">
        <h2 className="text-xl font-bold mb-2">Receipt not found</h2>
        <p className="text-slate-500 mb-6">{error || 'Order detail lookup failed'}</p>
        <Link to="/shop" className="rounded-xl bg-orange-500 text-white px-5 py-2.5 text-xs font-bold shadow-md">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/20 bg-white/60 dark:border-slate-800/40 dark:bg-slate-900/60 p-8 sm:p-12 backdrop-blur-md shadow-xl text-center space-y-8">
        
        {/* Animated Check */}
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-bounce">
            <CheckCircle2 className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-slate-900 dark:text-white">
            {t('orderSuccessHeader')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-xs sm:text-sm">
            {t('orderSuccessMessage')}
          </p>
        </div>

        {/* Order Details Panel */}
        <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 p-6 text-left space-y-4">
          <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200/50 dark:border-slate-800 pb-3">
            <span>{t('orderIdLabel')}</span>
            <span className="text-orange-500">{order._id}</span>
          </div>

          {/* Delivery Address Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block uppercase tracking-wide">Recipient Details</span>
              <p className="font-bold text-slate-800 dark:text-slate-200">{order.customerName}</p>
              <p className="text-slate-500">{order.customerPhone}</p>
              <p className="text-slate-500">{order.customerEmail}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-slate-400 font-bold block uppercase tracking-wide">Delivery Address</span>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {order.shippingAddress}
              </p>
            </div>
          </div>

          {/* Placed Items table */}
          <div className="border-t border-slate-200/50 dark:border-slate-800 pt-3 space-y-2">
            <span className="text-slate-400 font-bold text-xs block uppercase tracking-wide">Ordered Items</span>
            <div className="divide-y divide-slate-100 dark:divide-slate-900">
              {order.items.map((item, idx) => {
                const product = item.product;
                const displayName = (language === 'mr' && (product?.nameMR || item.nameMR)) 
                  ? (product?.nameMR || item.nameMR) 
                  : (product?.name || item.name || 'Product Details');
                return (
                  <div key={idx} className="flex justify-between items-center text-xs py-2">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold max-w-sm line-clamp-1">
                      {displayName} {item.selectedWeight && `(${item.selectedWeight})`} (x{item.quantity})
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      ₹{((item.priceAtPurchase || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200/50 dark:border-slate-800 pt-4 flex justify-between items-baseline font-bold">
            <div>
              <span className="text-xs text-slate-500 block">
                {order.paymentMethod === 'Razorpay' ? 'Paid via Razorpay Online:' : 'Amount to Pay (COD):'}
              </span>
              {order.transactionId && (
                <span className="text-[10px] text-emerald-600 font-mono">
                  Txn ID: {order.transactionId}
                </span>
              )}
            </div>
            <span className="text-xl text-orange-500 font-outfit">₹{order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center justify-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-4 py-1.5">
            <Truck className="h-4 w-4 text-emerald-500" />
            <span>{t('orderDeliveryEstimate')}</span>
          </span>
          <span className="flex items-center justify-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-900 px-4 py-1.5">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>Fulfillment Status: {order.fulfillmentStatus}</span>
          </span>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-bold py-3.5 px-8 text-xs hover:shadow-lg shadow-orange-500/10 hover:scale-102 transition-all duration-300"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{t('btnContinueShopping')}</span>
        </Link>

      </div>
    </div>
  );
};

export default OrderSuccessPage;
