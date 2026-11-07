import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, Image, Check, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Rangoli',
  'Sanskar Bharati Rangoli',
  'Portrait Color',
  'Fluorescent Color',
  'Tools',
  'Holi Color',
  'Gulal',
  'Signature Flagship',
  'Industrial & Utility',
  'Seasonal & Event'
];

const ProductModal = ({ isOpen, onClose, onSaved, productToEdit, token }) => {
  const isEditing = Boolean(productToEdit && productToEdit._id);

  const [formData, setFormData] = useState({
    name: '',
    nameMR: '',
    description: '',
    descriptionMR: '',
    mainCategory: 'Rangoli',
    subCategory: 'powders',
    price: '',
    wholesalePrice: '',
    minWholesaleQuantity: 20,
    stockQuantity: 100,
    imageUrlsText: '',
    tagsText: '',
    hasDiscount: false,
    discountPercentage: 10,
    discountStartDate: '',
    discountEndDate: '',
    discountEventName: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        nameMR: productToEdit.nameMR || '',
        description: productToEdit.description || '',
        descriptionMR: productToEdit.descriptionMR || '',
        mainCategory: productToEdit.mainCategory || 'Rangoli',
        subCategory: productToEdit.subCategory || 'powders',
        price: productToEdit.price != null ? productToEdit.price : '',
        wholesalePrice: productToEdit.wholesalePrice != null ? productToEdit.wholesalePrice : '',
        minWholesaleQuantity: productToEdit.minWholesaleQuantity != null ? productToEdit.minWholesaleQuantity : 20,
        stockQuantity: productToEdit.stockQuantity != null ? productToEdit.stockQuantity : 0,
        imageUrlsText: (productToEdit.imageUrls || []).join('\n'),
        tagsText: (productToEdit.tags || []).join(', '),
        hasDiscount: Boolean(productToEdit.seasonalDiscount && productToEdit.seasonalDiscount.discountPercentage),
        discountPercentage: productToEdit.seasonalDiscount?.discountPercentage || 10,
        discountStartDate: productToEdit.seasonalDiscount?.startDate ? new Date(productToEdit.seasonalDiscount.startDate).toISOString().slice(0, 10) : '',
        discountEndDate: productToEdit.seasonalDiscount?.endDate ? new Date(productToEdit.seasonalDiscount.endDate).toISOString().slice(0, 10) : '',
        discountEventName: productToEdit.seasonalDiscount?.eventName || ''
      });
    } else {
      setFormData({
        name: '',
        nameMR: '',
        description: '',
        descriptionMR: '',
        mainCategory: 'Rangoli',
        subCategory: 'powders',
        price: '',
        wholesalePrice: '',
        minWholesaleQuantity: 20,
        stockQuantity: 100,
        imageUrlsText: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&auto=format&fit=crop',
        tagsText: 'Rangoli, Festive, Organic',
        hasDiscount: false,
        discountPercentage: 10,
        discountStartDate: '',
        discountEndDate: '',
        discountEventName: ''
      });
    }
    setError(null);
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Parse image URLs
    const imageUrls = formData.imageUrlsText
      .split('\n')
      .map(url => url.trim())
      .filter(Boolean);

    if (imageUrls.length === 0) {
      setError('Please provide at least one valid image URL.');
      return;
    }

    // Parse tags
    const tags = formData.tagsText
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    // Build payload
    const payload = {
      name: formData.name.trim(),
      nameMR: formData.nameMR.trim(),
      description: formData.description.trim(),
      descriptionMR: formData.descriptionMR.trim(),
      mainCategory: formData.mainCategory,
      subCategory: formData.subCategory.trim(),
      price: Number(formData.price),
      wholesalePrice: Number(formData.wholesalePrice),
      minWholesaleQuantity: Number(formData.minWholesaleQuantity),
      stockQuantity: Number(formData.stockQuantity),
      imageUrls,
      tags
    };

    if (formData.hasDiscount && formData.discountPercentage) {
      if (!formData.discountStartDate || !formData.discountEndDate || !formData.discountEventName) {
        setError('Please fill all seasonal discount fields or uncheck the discount box.');
        return;
      }
      payload.seasonalDiscount = {
        discountPercentage: Number(formData.discountPercentage),
        startDate: new Date(formData.discountStartDate),
        endDate: new Date(formData.discountEndDate),
        eventName: formData.discountEventName.trim()
      };
    } else {
      payload.seasonalDiscount = null;
    }

    try {
      setSaving(true);
      const url = isEditing
        ? `/api/products/${productToEdit._id}`
        : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (data.errors && data.errors.join(', ')) || 'Failed to save product');
      }

      onSaved(data.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error occurred while saving product');
    } finally {
      setSaving(false);
    }
  };

  const previewImages = formData.imageUrlsText
    .split('\n')
    .map(url => url.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white font-bold shadow-md">
              🌸
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-outfit">
                {isEditing ? 'Edit Product Item' : 'Add New Product to Catalog'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing ? `Product ID: ${productToEdit._id}` : 'Fill in the bilingual details and inventory parameters.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Names in English & Marathi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Name (English) *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Premium Rangoli Magic Colors - Box of 12"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Name (मराठी Name)
              </label>
              <input
                type="text"
                name="nameMR"
                value={formData.nameMR}
                onChange={handleChange}
                placeholder="उदा. प्रीमियम रांगोळी मॅजिक रंग - १२ चा बॉक्स"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Main Category *
              </label>
              <select
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sub-Category *
              </label>
              <input
                type="text"
                name="subCategory"
                required
                value={formData.subCategory}
                onChange={handleChange}
                placeholder="e.g. powders, stencils, rollers, brushes"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Retail Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="any"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="299"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Wholesale Price (₹) *
              </label>
              <input
                type="number"
                name="wholesalePrice"
                min="0"
                step="any"
                required
                value={formData.wholesalePrice}
                onChange={handleChange}
                placeholder="149"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Min MOQ (Pcs) *
              </label>
              <input
                type="number"
                name="minWholesaleQuantity"
                min="1"
                required
                value={formData.minWholesaleQuantity}
                onChange={handleChange}
                placeholder="20"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="250"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Image URLs & Preview */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product Image URLs (One URL per line) *
            </label>
            <textarea
              name="imageUrlsText"
              rows={2}
              required
              value={formData.imageUrlsText}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
            {previewImages.length > 0 && (
              <div className="flex items-center gap-2 mt-2 overflow-x-auto py-1">
                {previewImages.map((img, i) => (
                  <div key={i} className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                    <img src={img} alt="Preview" className="h-full w-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Descriptions English & Marathi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description (English) *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Super-fine organic rangoli powder with vibrant tint..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description (मराठी)
              </label>
              <textarea
                name="descriptionMR"
                rows={3}
                value={formData.descriptionMR}
                onChange={handleChange}
                placeholder="सणांच्या सजावटीसाठी अतिशय बारीक, सेंद्रिय व दोलायमान रांगोळी..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Festive & Search Tags (Comma separated)
            </label>
            <input
              type="text"
              name="tagsText"
              value={formData.tagsText}
              onChange={handleChange}
              placeholder="Diwali, Ganpati, Dussehra, Best Seller, Sanskar Bharati"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Seasonal Discount Toggle */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="hasDiscount"
                checked={formData.hasDiscount}
                onChange={handleChange}
                className="h-4 w-4 rounded-md border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Enable Festive / Seasonal Discount Promo
              </span>
            </label>

            {formData.hasDiscount && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    min="1"
                    max="90"
                    value={formData.discountPercentage}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Event Name
                  </label>
                  <input
                    type="text"
                    name="discountEventName"
                    value={formData.discountEventName}
                    onChange={handleChange}
                    placeholder="Diwali Utsav"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="discountStartDate"
                    value={formData.discountStartDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="discountEndDate"
                    value={formData.discountEndDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-orange-600 hover:to-rose-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving Product...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
