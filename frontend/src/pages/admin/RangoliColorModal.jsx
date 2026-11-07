import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Check,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Trash2,
  Camera,
  Palette,
  Layers
} from 'lucide-react';

const RANGOLI_CATEGORIES = [
  'Standard',
  'Fluorescent',
  'White Powder',
  'Special Festive'
];

const SANSKAR_CATEGORIES = [
  'Vibrant Warm',
  'Deep Royal',
  'Cool Pastel',
  'Soft Pastel',
  'Rich Tone',
  'Neon Glow',
  'Festive Vibrant',
  'Foundation Essential'
];

/**
 * Client-side Canvas Image Compressor
 */
const compressImageFile = (file, maxWidth = 900, quality = 0.85) => {
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

const RangoliColorModal = ({
  isOpen,
  onClose,
  colorToEdit,
  defaultColorType = 'rangoli', // 'rangoli' or 'sanskar_bharati'
  onSaved,
  token
}) => {
  const fileInputRef = useRef(null);
  const isEdit = Boolean(colorToEdit);

  const [formData, setFormData] = useState({
    colorType: defaultColorType,
    number: '',
    nameEn: '',
    nameMr: '',
    shadeName: '',
    category: defaultColorType === 'sanskar_bharati' ? 'Vibrant Warm' : 'Standard',
    hex: '#FF5722',
    image: '',
    descriptionEn: '',
    descriptionMr: '',
    textureDetails: ''
  });

  // Weights / Packet sizes state (array of { key, label, retailPrice, wholesalePrice })
  const [packetSizes, setPacketSizes] = useState([
    { key: '250gm', label: '250gm', retailPrice: 35, wholesalePrice: 20 },
    { key: '500gm', label: '500gm', retailPrice: 60, wholesalePrice: 35 },
    { key: '1000gm', label: '1000gm', retailPrice: 110, wholesalePrice: 60 }
  ]);

  const [newWeightName, setNewWeightName] = useState('');
  const [newWeightRetail, setNewWeightRetail] = useState('');
  const [newWeightWholesale, setNewWeightWholesale] = useState('');

  const [imageInputMode, setImageInputMode] = useState('file'); // 'file' or 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (colorToEdit) {
      setFormData({
        colorType: colorToEdit.colorType || defaultColorType,
        number: colorToEdit.number || '',
        nameEn: colorToEdit.nameEn || '',
        nameMr: colorToEdit.nameMr || '',
        shadeName: colorToEdit.shadeName || '',
        category: colorToEdit.category || (colorToEdit.colorType === 'sanskar_bharati' ? 'Vibrant Warm' : 'Standard'),
        hex: colorToEdit.hex || '#FF5722',
        image: colorToEdit.image || '',
        descriptionEn: colorToEdit.descriptionEn || '',
        descriptionMr: colorToEdit.descriptionMr || '',
        textureDetails: colorToEdit.textureDetails || ''
      });

      // Parse existing weights
      if (colorToEdit.weights && typeof colorToEdit.weights === 'object') {
        const parsed = Object.entries(colorToEdit.weights).map(([wKey, wVal]) => ({
          key: wKey,
          label: wVal.label || wKey,
          retailPrice: wVal.retailPrice != null ? wVal.retailPrice : 35,
          wholesalePrice: wVal.wholesalePrice != null ? wVal.wholesalePrice : 20
        }));
        setPacketSizes(parsed);
      } else {
        setPacketSizes([
          { key: '250gm', label: '250gm', retailPrice: 35, wholesalePrice: 20 },
          { key: '500gm', label: '500gm', retailPrice: 60, wholesalePrice: 35 },
          { key: '1000gm', label: '1000gm', retailPrice: 110, wholesalePrice: 60 }
        ]);
      }
    } else {
      // New color creation
      const isSanskar = defaultColorType === 'sanskar_bharati';
      setFormData({
        colorType: defaultColorType,
        number: '',
        nameEn: '',
        nameMr: '',
        shadeName: '',
        category: isSanskar ? 'Vibrant Warm' : 'Standard',
        hex: '#FF5722',
        image: '',
        descriptionEn: '',
        descriptionMr: '',
        textureDetails: ''
      });

      setPacketSizes(
        isSanskar
          ? [
              { key: '250gm', label: '250gm', retailPrice: 40, wholesalePrice: 25 },
              { key: '500gm', label: '500gm', retailPrice: 75, wholesalePrice: 45 },
              { key: '1000gm', label: '1000gm', retailPrice: 140, wholesalePrice: 80 }
            ]
          : [
              { key: '250gm', label: '250gm', retailPrice: 35, wholesalePrice: 20 },
              { key: '500gm', label: '500gm', retailPrice: 60, wholesalePrice: 35 },
              { key: '1000gm', label: '1000gm', retailPrice: 110, wholesalePrice: 60 }
            ]
      );
    }
    setError(null);
  }, [colorToEdit, defaultColorType, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'colorType') {
      const isSanskar = value === 'sanskar_bharati';
      setFormData(prev => ({
        ...prev,
        colorType: value,
        category: isSanskar ? 'Vibrant Warm' : 'Standard'
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Packet size price adjustments
  const handleWeightChange = (index, field, value) => {
    setPacketSizes(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === 'label' ? value : Number(value)
      };
      return copy;
    });
  };

  const handleRemoveWeight = (index) => {
    if (packetSizes.length <= 1) {
      alert('Color must have at least one packet size.');
      return;
    }
    setPacketSizes(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAddWeight = () => {
    if (!newWeightName.trim()) {
      alert('Please enter a weight label (e.g. 100gm, 2kg, 5kg)');
      return;
    }
    const cleanKey = newWeightName.trim();
    if (packetSizes.some(w => w.key.toLowerCase() === cleanKey.toLowerCase())) {
      alert('This packet size already exists.');
      return;
    }

    setPacketSizes(prev => [
      ...prev,
      {
        key: cleanKey,
        label: cleanKey,
        retailPrice: Number(newWeightRetail) || 35,
        wholesalePrice: Number(newWeightWholesale) || 20
      }
    ]);

    setNewWeightName('');
    setNewWeightRetail('');
    setNewWeightWholesale('');
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      const compressedDataUrl = await compressImageFile(file);
      setFormData(prev => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      setError('Failed to process image file: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nameEn.trim()) {
      setError('English Name is required (e.g. 2. YELLOW)');
      return;
    }

    if (packetSizes.length === 0) {
      setError('At least one packet size / weight variant is required.');
      return;
    }

    // Convert packetSizes array back to dictionary object
    const weightsDict = {};
    packetSizes.forEach(item => {
      weightsDict[item.key] = {
        label: item.label || item.key,
        retailPrice: Number(item.retailPrice) || 0,
        wholesalePrice: Number(item.wholesalePrice) || 0
      };
    });

    const payload = {
      colorType: formData.colorType,
      number: formData.number.trim() || '1',
      nameEn: formData.nameEn.trim(),
      nameMr: formData.nameMr.trim(),
      shadeName: formData.shadeName.trim() || formData.nameEn.trim(),
      category: formData.category,
      hex: formData.hex.trim(),
      image: formData.image.trim(),
      descriptionEn: formData.descriptionEn.trim(),
      descriptionMr: formData.descriptionMr.trim(),
      textureDetails: formData.textureDetails.trim(),
      weights: weightsDict
    };

    try {
      setSaving(true);
      const url = isEdit
        ? `/api/colors/${colorToEdit.id || colorToEdit._id}`
        : '/api/colors';
      const method = isEdit ? 'PUT' : 'POST';

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
        throw new Error(data.message || `Failed to ${isEdit ? 'update' : 'create'} color shade`);
      }

      onSaved(data.data);
      onClose();
    } catch (err) {
      setError(err.message || 'Error processing color shade');
    } finally {
      setSaving(false);
    }
  };

  const activeCategories = formData.colorType === 'sanskar_bharati' ? SANSKAR_CATEGORIES : RANGOLI_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-auto text-left animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/75">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-md border-2 border-white/80 dark:border-slate-800"
              style={{ backgroundColor: formData.hex }}
            >
              <Palette className="h-5 w-5 text-white drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-outfit">
                {isEdit ? `Edit Shade: ${colorToEdit.nameEn}` : `Add New ${formData.colorType === 'sanskar_bharati' ? 'Sanskar Bharati Powder' : 'Rangoli Color Shade'}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit ? `${colorToEdit.nameMr || colorToEdit.category} • Configured Packet Sizes & Pricing` : 'Fill in color attributes, swatch, and packet sizes'}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Color Type Selector (Only in Add Mode) */}
          {!isEdit && (
            <div className="p-3.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/60">
              <label className="block text-xs font-bold text-orange-900 dark:text-orange-200 uppercase tracking-wider mb-2">
                Color Collection Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.colorType === 'rangoli'
                    ? 'border-orange-500 bg-white dark:bg-slate-900 shadow-sm text-orange-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="colorType"
                    value="rangoli"
                    checked={formData.colorType === 'rangoli'}
                    onChange={handleChange}
                    className="accent-orange-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">🌸 Rangoli Color Shade</p>
                    <p className="text-[10px] text-slate-400">Standard / Fluorescent</p>
                  </div>
                </label>

                <label className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.colorType === 'sanskar_bharati'
                    ? 'border-rose-500 bg-white dark:bg-slate-900 shadow-sm text-rose-600 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="colorType"
                    value="sanskar_bharati"
                    checked={formData.colorType === 'sanskar_bharati'}
                    onChange={handleChange}
                    className="accent-rose-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">🌀 Sanskar Bharati Powder</p>
                    <p className="text-[10px] text-slate-400">Super-fine textured powder</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Basic Shade Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shade No. *
              </label>
              <input
                type="text"
                name="number"
                required
                value={formData.number}
                onChange={handleChange}
                placeholder="e.g. 24"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Name (English) *
              </label>
              <input
                type="text"
                name="nameEn"
                required
                value={formData.nameEn}
                onChange={handleChange}
                placeholder="e.g. 24. EMERALD GREEN"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Name (मराठी)
              </label>
              <input
                type="text"
                name="nameMr"
                value={formData.nameMr}
                onChange={handleChange}
                placeholder="उदा. २४. पाचू हिरवा"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shade Name (Short)
              </label>
              <input
                type="text"
                name="shadeName"
                value={formData.shadeName}
                onChange={handleChange}
                placeholder="e.g. Emerald Green"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Color Category & Hex Color Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Color Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-hidden focus:border-orange-500"
              >
                {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Hex Color Shade
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name="hex"
                  value={formData.hex}
                  onChange={handleChange}
                  className="h-9 w-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  name="hex"
                  value={formData.hex}
                  onChange={handleChange}
                  placeholder="#FF5722"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* PACKET SIZES & WEIGHTS PRICING MANAGER */}
          <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-900/60 bg-orange-50/40 dark:bg-orange-950/20 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-extrabold text-orange-900 dark:text-orange-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  Packet Sizes & Pricing Configuration
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Configure retail (ग्राहक) and wholesale (घाऊक) rates for each packet weight variant
                </p>
              </div>
            </div>

            {/* List of current packet sizes */}
            <div className="space-y-2 mb-4">
              <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2">
                <span className="col-span-4">Packet Weight</span>
                <span className="col-span-3">Retail Price (₹)</span>
                <span className="col-span-3">Wholesale (₹)</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {packetSizes.map((pkt, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-orange-200/80 dark:border-slate-700 shadow-2xs">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={pkt.label}
                      onChange={(e) => handleWeightChange(idx, 'label', e.target.value)}
                      placeholder="e.g. 250gm"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={pkt.retailPrice}
                        onChange={(e) => handleWeightChange(idx, 'retailPrice', e.target.value)}
                        placeholder="35"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 pl-5 pr-2 py-1 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, 'retailPrice', Math.max(0, (Number(pkt.retailPrice) || 0) - 5))}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[9px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, 'retailPrice', (Number(pkt.retailPrice) || 0) + 5)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[9px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-2 top-1 text-xs text-indigo-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={pkt.wholesalePrice}
                        onChange={(e) => handleWeightChange(idx, 'wholesalePrice', e.target.value)}
                        placeholder="20"
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 pl-5 pr-2 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, 'wholesalePrice', Math.max(0, (Number(pkt.wholesalePrice) || 0) - 5))}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[9px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleWeightChange(idx, 'wholesalePrice', (Number(pkt.wholesalePrice) || 0) + 5)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[9px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveWeight(idx)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Remove packet size"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add new packet size row */}
            <div className="pt-3 border-t border-orange-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={newWeightName}
                onChange={(e) => setNewWeightName(e.target.value)}
                placeholder="+ Add size (e.g. 100gm, 2kg)"
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 w-36"
              />
              <input
                type="number"
                min="0"
                value={newWeightRetail}
                onChange={(e) => setNewWeightRetail(e.target.value)}
                placeholder="Retail ₹"
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 w-24"
              />
              <input
                type="number"
                min="0"
                value={newWeightWholesale}
                onChange={(e) => setNewWeightWholesale(e.target.value)}
                placeholder="Wholesale ₹"
                className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white bg-white dark:bg-slate-900 w-28"
              />
              <button
                type="button"
                onClick={handleAddWeight}
                className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                + Add Size
              </button>
            </div>
          </div>

          {/* Product Image Selection (File or URL) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Shade Product Photo
              </label>
              <div className="inline-flex rounded-lg bg-slate-200 dark:bg-slate-800 p-0.5">
                <button
                  type="button"
                  onClick={() => setImageInputMode('file')}
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${imageInputMode === 'file' ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${imageInputMode === 'url' ? 'bg-white dark:bg-slate-900 text-orange-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Image URL
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {imageInputMode === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-orange-400 text-center cursor-pointer transition-colors"
              >
                <Camera className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {uploadingImage ? 'Compressing & saving image...' : 'Click to choose image file from device'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP auto-optimized</p>
              </div>
            ) : (
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://... or /colors/..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            )}

            {formData.image && (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={formData.image}
                  alt="Color Preview"
                  className="h-16 w-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                  onError={(e) => { e.target.src = '/colors/shade-card.jpg'; }}
                />
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Image Attached</span>
                  <p className="text-[10px] text-slate-400 truncate max-w-xs">{formData.image.slice(0, 45)}...</p>
                </div>
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description (English)
              </label>
              <textarea
                name="descriptionEn"
                rows={2}
                value={formData.descriptionEn}
                onChange={handleChange}
                placeholder="Super-fine rangoli color powder..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Description (मराठी)
              </label>
              <textarea
                name="descriptionMr"
                rows={2}
                value={formData.descriptionMr}
                onChange={handleChange}
                placeholder="सणांच्या सजावटीसाठी अतिशय बारीक रांगोळी रंग..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              disabled={saving || uploadingImage}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>{isEdit ? 'Save Changes' : 'Create Color Shade'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RangoliColorModal;
