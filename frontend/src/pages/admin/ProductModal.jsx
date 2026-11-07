import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Sparkles, Image, Check, AlertCircle, Upload, Link, Trash2, Camera } from 'lucide-react';

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

/**
 * Client-side Canvas Image Compressor
 * Resizes images to max 1000px and 85% JPEG quality to ensure fast uploads and low DB footprint.
 */
const compressImageFile = (file, maxWidth = 1000, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const ProductModal = ({ isOpen, onClose, onSaved, productToEdit, token }) => {
  const isEditing = Boolean(productToEdit && productToEdit._id);
  const fileInputRef = useRef(null);

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
    tagsText: '',
    hasDiscount: false,
    discountPercentage: 10,
    discountStartDate: '',
    discountEndDate: '',
    discountEventName: ''
  });

  // Images state
  const [images, setImages] = useState([]);
  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
        tagsText: (productToEdit.tags || []).join(', '),
        hasDiscount: Boolean(productToEdit.seasonalDiscount && productToEdit.seasonalDiscount.discountPercentage),
        discountPercentage: productToEdit.seasonalDiscount?.discountPercentage || 10,
        discountStartDate: productToEdit.seasonalDiscount?.startDate ? new Date(productToEdit.seasonalDiscount.startDate).toISOString().slice(0, 10) : '',
        discountEndDate: productToEdit.seasonalDiscount?.endDate ? new Date(productToEdit.seasonalDiscount.endDate).toISOString().slice(0, 10) : '',
        discountEventName: productToEdit.seasonalDiscount?.eventName || ''
      });
      setImages(productToEdit.imageUrls || []);
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
        tagsText: 'Rangoli, Festive, Organic',
        hasDiscount: false,
        discountPercentage: 10,
        discountStartDate: '',
        discountEndDate: '',
        discountEventName: ''
      });
      setImages([]);
    }
    setUrlInput('');
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

  // Process selected file(s)
  const processFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    setError(null);
    setUploadingFiles(true);

    try {
      const validFiles = Array.from(filesList).filter(f => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setError('Please select valid image files (JPG, PNG, WEBP).');
        setUploadingFiles(false);
        return;
      }

      const compressedResults = await Promise.all(
        validFiles.map(file => compressImageFile(file))
      );

      setImages(prev => [...prev, ...compressedResults]);
    } catch (err) {
      setError('Failed to process image file: ' + err.message);
    } finally {
      setUploadingFiles(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  // Add image via URL
  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setImages(prev => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  // Remove an image from list
  const handleRemoveImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Set an image as primary (move to 1st position)
  const handleSetPrimary = (indexToPrimary) => {
    setImages(prev => {
      const selected = prev[indexToPrimary];
      const remaining = prev.filter((_, idx) => idx !== indexToPrimary);
      return [selected, ...remaining];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError('Please choose or upload at least one product image file.');
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
      imageUrls: images,
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
                {isEditing ? `Product ID: ${productToEdit._id}` : 'Upload product photos from your device and set catalog details.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500 cursor-pointer"
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

          {/* ======================================================== */}
          {/* PRODUCT IMAGE ATTACHMENT SECTION (FILE UPLOAD OR URL)   */}
          {/* ======================================================== */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Product Image Photos *
                </label>
                <p className="text-[11px] text-slate-500">
                  Choose image file from your computer or phone (auto-optimized)
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-0.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageInputMode === 'file' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${imageInputMode === 'url' ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  <Link className="h-3.5 w-3.5" />
                  <span>Use Web URL</span>
                </button>
              </div>
            </div>

            {/* Hidden Native File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Mode 1: File Upload Drag & Drop Area */}
            {imageInputMode === 'file' && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${isDragging ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 scale-[1.01]' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-orange-400 hover:bg-orange-50/20'}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 mb-2">
                  {uploadingFiles ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  ) : (
                    <Camera className="h-6 w-6" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {uploadingFiles ? 'Processing & optimizing photo...' : 'Click to Browse File or Drag & Drop'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports PNG, JPG, JPEG, WEBP from your device (multiple files allowed)
                </p>
                <button
                  type="button"
                  className="mt-3 px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-colors pointer-events-none"
                >
                  Choose Image File
                </button>
              </div>
            )}

            {/* Mode 2: Web URL Input Area */}
            {imageInputMode === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-orange-500 transition-colors cursor-pointer"
                >
                  Add URL
                </button>
              </div>
            )}

            {/* Attached Images Gallery & Thumbnail Management */}
            {images.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Attached Photos ({images.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Another File</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((imgSrc, idx) => (
                    <div
                      key={idx}
                      className="group relative h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 shadow-xs"
                    >
                      <img
                        src={imgSrc}
                        alt={`Product ${idx + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=200';
                        }}
                      />

                      {/* Primary badge for first image */}
                      {idx === 0 ? (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-orange-600 text-[9px] font-black uppercase text-white shadow-xs">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-md bg-slate-900/80 hover:bg-orange-600 text-[9px] font-bold text-white transition-all cursor-pointer"
                          title="Set as Cover Photo"
                        >
                          Make Cover
                        </button>
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
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
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingFiles}
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
