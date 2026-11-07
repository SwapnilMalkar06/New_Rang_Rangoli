const RangoliColor = require('../models/RangoliColor');
const { initialRangoliColors, initialSanskarBharatiColors } = require('../data/initialColors');

/**
 * Seed initial colors if none exist
 */
const seedColorsIfEmpty = async () => {
  const count = await RangoliColor.countDocuments();
  if (count === 0) {
    console.log('Seeding initial Rangoli Color Shades and Sanskar Bharati Powders...');
    const rangoliDocs = initialRangoliColors.map((c, idx) => ({
      ...c,
      colorType: 'rangoli',
      orderIndex: idx + 1
    }));
    const sanskarDocs = initialSanskarBharatiColors.map((c, idx) => ({
      ...c,
      colorType: 'sanskar_bharati',
      orderIndex: idx + 1
    }));

    await RangoliColor.insertMany([...rangoliDocs, ...sanskarDocs]);
    console.log('Seeded 39 authentic rangoli color shades and powder catalog into database!');
  }
};

/**
 * @desc    Get all colors with packet weights and pricing (Public)
 * @route   GET /api/colors
 * @access  Public
 */
exports.getAllColors = async (req, res) => {
  try {
    await seedColorsIfEmpty();

    const { type, search } = req.query;
    const query = {};
    if (type) {
      query.colorType = type;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameEn: regex },
        { nameMr: regex },
        { shadeName: regex },
        { category: regex },
        { number: regex }
      ];
    }

    const colors = await RangoliColor.find(query).sort({ orderIndex: 1, createdAt: 1 }).lean();

    const rangoli = colors.filter(c => c.colorType === 'rangoli');
    const sanskarBharati = colors.filter(c => c.colorType === 'sanskar_bharati');

    res.status(200).json({
      success: true,
      count: colors.length,
      data: {
        all: colors,
        rangoli,
        sanskarBharati
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve rangoli color catalog',
      error: error.message
    });
  }
};

/**
 * @desc    Get single color details
 * @route   GET /api/colors/:id
 * @access  Public
 */
exports.getColorById = async (req, res) => {
  try {
    const color = await RangoliColor.findOne({
      $or: [{ id: req.params.id }, { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }]
    });

    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color shade not found'
      });
    }

    res.status(200).json({
      success: true,
      data: color
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving color shade',
      error: error.message
    });
  }
};

/**
 * @desc    Update color details, packet sizes, and pricing
 * @route   PUT /api/colors/:id
 * @access  Private/Admin
 */
exports.updateColor = async (req, res) => {
  try {
    const identifier = req.params.id;
    let color = await RangoliColor.findOne({
      $or: [{ id: identifier }, { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }]
    });

    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color shade not found'
      });
    }

    const {
      nameEn,
      nameMr,
      shadeName,
      category,
      hex,
      image,
      descriptionEn,
      descriptionMr,
      textureDetails,
      weights,
      inStock
    } = req.body;

    if (nameEn !== undefined) color.nameEn = nameEn;
    if (nameMr !== undefined) color.nameMr = nameMr;
    if (shadeName !== undefined) color.shadeName = shadeName;
    if (category !== undefined) color.category = category;
    if (hex !== undefined) color.hex = hex;
    if (image !== undefined) color.image = image;
    if (descriptionEn !== undefined) color.descriptionEn = descriptionEn;
    if (descriptionMr !== undefined) color.descriptionMr = descriptionMr;
    if (textureDetails !== undefined) color.textureDetails = textureDetails;
    if (weights !== undefined) color.weights = weights;
    if (inStock !== undefined) color.inStock = inStock;

    const updated = await color.save();

    res.status(200).json({
      success: true,
      message: 'Color shade and packet weights updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update color shade',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new color shade
 * @route   POST /api/colors
 * @access  Private/Admin
 */
exports.createColor = async (req, res) => {
  try {
    const {
      id,
      colorType,
      number,
      nameEn,
      nameMr,
      shadeName,
      category,
      hex,
      image,
      descriptionEn,
      descriptionMr,
      weights
    } = req.body;

    const shadeId = id || `color-${Date.now()}`;
    const newColor = new RangoliColor({
      id: shadeId,
      colorType: colorType || 'rangoli',
      number: number || '99',
      nameEn,
      nameMr: nameMr || '',
      shadeName: shadeName || nameEn,
      category: category || 'Standard',
      hex: hex || '#FF0000',
      image: image || '/colors/shade-card.jpg',
      descriptionEn: descriptionEn || '',
      descriptionMr: descriptionMr || '',
      weights: weights || {
        '250gm': { retailPrice: 35, wholesalePrice: 20, label: '250gm' },
        '500gm': { retailPrice: 60, wholesalePrice: 35, label: '500gm' },
        '1000gm': { retailPrice: 110, wholesalePrice: 60, label: '1000gm' }
      }
    });

    const saved = await newColor.save();

    res.status(201).json({
      success: true,
      message: 'New color shade created successfully',
      data: saved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create color shade',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a color shade
 * @route   DELETE /api/colors/:id
 * @access  Private/Admin
 */
exports.deleteColor = async (req, res) => {
  try {
    const identifier = req.params.id;
    const color = await RangoliColor.findOneAndDelete({
      $or: [{ id: identifier }, { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }]
    });

    if (!color) {
      return res.status(404).json({
        success: false,
        message: 'Color shade not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Color shade deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete color shade',
      error: error.message
    });
  }
};
