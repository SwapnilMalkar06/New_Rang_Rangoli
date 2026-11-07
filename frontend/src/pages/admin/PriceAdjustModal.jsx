import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Sparkles,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent
} from 'lucide-react';

/**
 * PriceAdjustModal
 * Handles both:
 * 1. Single shade price adjustment (Retail & Wholesale for all its packet sizes)
 * 2. Batch price adjustment across all 23 Rangoli shades or 16 Sanskar Bharati powders
 */
export default function PriceAdjustModal({
  isOpen,
  onClose,
  targetColor, // null if batch mode, or color object for single shade mode
  defaultCatalogType = 'rangoli', // 'rangoli' or 'sanskar'
  totalShadesCount = 23,
  token,
  onSaved
}) {
  if (!isOpen) return null;

  const isBatch = !targetColor;

  // Single shade state
  const initialWeights = targetColor?.weights
    ? Object.entries(targetColor.weights).map(([key, val]) => ({
        key,
        label: val.label || key,
        retailPrice: val.retailPrice || 0,
        wholesalePrice: val.wholesalePrice || 0
      }))
    : [
        { key: '250gm', label: '250gm', retailPrice: 35, wholesalePrice: 20 },
        { key: '500gm', label: '500gm', retailPrice: 60, wholesalePrice: 35 },
        { key: '1000gm', label: '1000gm', retailPrice: 110, wholesalePrice: 60 }
      ];

  const [singleWeights, setSingleWeights] = useState(initialWeights);

  // Batch mode state
  const [batchScope, setBatchScope] = useState(
    defaultCatalogType === 'sanskar' ? 'sanskar_bharati' : 'rangoli'
  );
  const [batchCategory, setBatchCategory] = useState('All');
  const [batchActionType, setBatchActionType] = useState('fixed'); // 'fixed' or 'delta'

  // Batch fixed prices
  const [batchFixedPrices, setBatchFixedPrices] = useState({
    '250gm': { retailPrice: 35, wholesalePrice: 20 },
    '500gm': { retailPrice: 60, wholesalePrice: 35 },
    '1000gm': { retailPrice: 110, wholesalePrice: 60 }
  });

  // Batch delta adjustments
  const [batchDeltas, setBatchDeltas] = useState({
    '250gm': { deltaRetail: 0, deltaWholesale: 0 },
    '500gm': { deltaRetail: 0, deltaWholesale: 0 },
    '1000gm': { deltaRetail: 0, deltaWholesale: 0 }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Handle single shade price changes
  const handleSingleWeightChange = (idx, field, value) => {
    const num = value === '' ? '' : Math.max(0, Number(value));
    setSingleWeights(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: num };
      return copy;
    });
  };

  // Quick delta increment for single shade
  const handleQuickDelta = (idx, field, delta) => {
    setSingleWeights(prev => {
      const copy = [...prev];
      const current = Number(copy[idx][field]) || 0;
      copy[idx] = { ...copy[idx], [field]: Math.max(0, current + delta) };
      return copy;
    });
  };

  // Save Single Shade Price
  const handleSaveSingle = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const weightsPayload = {};
      singleWeights.forEach(w => {
        weightsPayload[w.key] = {
          label: w.label,
          retailPrice: Number(w.retailPrice) || 0,
          wholesalePrice: Number(w.wholesalePrice) || 0
        };
      });

      const res = await fetch(`/api/colors/${targetColor.id || targetColor._id}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ weights: weightsPayload })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update prices');
      }

      setSuccessMessage(`Prices for ${targetColor.nameEn} saved successfully!`);
      setTimeout(() => {
        onSaved(data.data);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save prices');
    } finally {
      setLoading(false);
    }
  };

  // Save Batch Pricing
  const handleSaveBatch = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        colorType: batchScope === 'all' ? undefined : batchScope,
        category: batchCategory === 'All' ? undefined : batchCategory
      };

      if (batchActionType === 'fixed') {
        payload.pricing = batchFixedPrices;
      } else {
        payload.deltaPricing = batchDeltas;
      }

      const res = await fetch('/api/colors/batch-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to apply batch pricing');
      }

      setSuccessMessage(data.message || 'Pricing updated across shades!');
      setTimeout(() => {
        onSaved();
        onClose();
      }, 900);
    } catch (err) {
      setError(err.message || 'Failed to execute batch price update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto text-left animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            {targetColor ? (
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md border-2 border-white dark:border-slate-800"
                style={{ backgroundColor: targetColor.hex || '#FF5722' }}
              >
                <span className="text-white text-xs font-black drop-shadow-md">
                  {targetColor.number || '₹'}
                </span>
              </div>
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
            )}
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-outfit">
                {isBatch ? '⚡ Batch Price Adjuster' : `Adjust Price: ${targetColor.nameEn}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isBatch
                  ? `Update rates across ${totalShadesCount} color shades in 1 click`
                  : `${targetColor.nameMr || targetColor.category} • Configured Packet Sizes`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          {/* ================= MODE 1: SINGLE SHADE PRICE ADJUSTMENT ================= */}
          {!isBatch && (
            <form onSubmit={handleSaveSingle} className="space-y-5">
              <div className="rounded-2xl border border-orange-200/80 dark:border-slate-800 bg-orange-50/30 dark:bg-orange-950/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-orange-500" />
                    Configure Rates per Packet Variant
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Active in live cart immediately
                  </span>
                </div>

                <div className="space-y-3">
                  {singleWeights.map((w, idx) => {
                    const margin = w.retailPrice > 0
                      ? Math.round(((w.retailPrice - w.wholesalePrice) / w.retailPrice) * 100)
                      : 0;

                    return (
                      <div
                        key={w.key || idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                            📦 {w.label || w.key} Packet
                          </span>
                          {margin > 0 && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {margin}% Retail Margin
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Retail Price */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Retail Price (ग्राहक दर)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                value={w.retailPrice}
                                onChange={(e) => handleSingleWeightChange(idx, 'retailPrice', e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                              />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'retailPrice', -5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'retailPrice', +5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'retailPrice', +10)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                +10
                              </button>
                            </div>
                          </div>

                          {/* Wholesale Price */}
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Wholesale Price (घाऊक दर)
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-xs font-bold text-indigo-500">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="any"
                                required
                                value={w.wholesalePrice}
                                onChange={(e) => handleSingleWeightChange(idx, 'wholesalePrice', e.target.value)}
                                className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400 focus:outline-hidden focus:border-indigo-500"
                              />
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'wholesalePrice', -5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                -5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'wholesalePrice', +5)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                +5
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickDelta(idx, 'wholesalePrice', +10)}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                              >
                                +10
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>Save New Prices</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE 2: BATCH / BULK PRICE ADJUSTER ================= */}
          {isBatch && (
            <form onSubmit={handleSaveBatch} className="space-y-5">
              {/* Target Scope Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Apply To Catalog *
                  </label>
                  <select
                    value={batchScope}
                    onChange={(e) => setBatchScope(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="rangoli">🌸 All 23 Rangoli Color Shades</option>
                    <option value="sanskar_bharati">🌀 All 16 Sanskar Bharati Powders</option>
                    <option value="all">🌟 Entire Color Catalog (39 Items)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pricing Mode *
                  </label>
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    <button
                      type="button"
                      onClick={() => setBatchActionType('fixed')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        batchActionType === 'fixed'
                          ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Set Standard Rates
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchActionType('delta')}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        batchActionType === 'delta'
                          ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Increase / Decrease (±₹)
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Option A: Fixed Rates for Each Packet Size */}
              {batchActionType === 'fixed' && (
                <div className="rounded-2xl border border-orange-200 dark:border-slate-800 bg-orange-50/20 dark:bg-orange-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-orange-500" />
                      Uniform Rates Across All Selected Shades
                    </span>
                    <span className="text-[11px] text-slate-400">All matching shades will receive these rates</span>
                  </div>

                  {['250gm', '500gm', '1000gm'].map((wKey) => (
                    <div
                      key={wKey}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="w-28 shrink-0">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          📦 {wKey}
                        </span>
                        <p className="text-[10px] text-slate-400">Standard Packet</p>
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Retail (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={batchFixedPrices[wKey]?.retailPrice ?? ''}
                            onChange={(e) =>
                              setBatchFixedPrices(prev => ({
                                ...prev,
                                [wKey]: { ...prev[wKey], retailPrice: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-indigo-500 mb-0.5">
                            Wholesale (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={batchFixedPrices[wKey]?.wholesalePrice ?? ''}
                            onChange={(e) =>
                              setBatchFixedPrices(prev => ({
                                ...prev,
                                [wKey]: { ...prev[wKey], wholesalePrice: Number(e.target.value) }
                              }))
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Sub-Option B: Incremental Delta (e.g. +₹5 festive hike) */}
              {batchActionType === 'delta' && (
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      Add or Subtract from Current Rates (e.g. +5 or -5)
                    </span>
                    <span className="text-[11px] text-slate-400">Leaves non-modified sizes unchanged</span>
                  </div>

                  {['250gm', '500gm', '1000gm'].map((wKey) => (
                    <div
                      key={wKey}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="w-28 shrink-0">
                        <span className="font-black text-xs text-slate-900 dark:text-white">
                          📦 {wKey}
                        </span>
                        <p className="text-[10px] text-slate-400">Delta Adjustment</p>
                      </div>

                      <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Retail ± (₹)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={batchDeltas[wKey]?.deltaRetail ?? 0}
                            onChange={(e) =>
                              setBatchDeltas(prev => ({
                                ...prev,
                                [wKey]: { ...prev[wKey], deltaRetail: Number(e.target.value) }
                              }))
                            }
                            placeholder="+0"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] font-bold text-indigo-500 mb-0.5">
                            Wholesale ± (₹)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={batchDeltas[wKey]?.deltaWholesale ?? 0}
                            onChange={(e) =>
                              setBatchDeltas(prev => ({
                                ...prev,
                                [wKey]: { ...prev[wKey], deltaWholesale: Number(e.target.value) }
                              }))
                            }
                            placeholder="+0"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs font-bold shadow-md shadow-orange-500/25 disabled:opacity-60 transition-all cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>Apply Bulk Price Adjustment</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
