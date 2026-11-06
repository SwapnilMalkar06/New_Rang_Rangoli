const Product = require('../models/Product');

/**
 * @desc    Get all products with filtering, search, and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
  try {
    const { 
      mainCategory, 
      subCategory, 
      tag, 
      minPrice, 
      maxPrice, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query object
    const query = {};

    // Filter by mainCategory
    if (mainCategory) {
      query.mainCategory = mainCategory;
    }

    // Filter by subCategory
    if (subCategory) {
      query.subCategory = subCategory;
    }

    // Filter by tag (case-insensitive, handles combined tags like "Navaratri & Dussehra")
    if (tag) {
      const tagPattern = tag.includes('&')
        ? tag.split('&').map(t => t.trim()).filter(Boolean).join('|')
        : tag;
      query.tags = { $regex: new RegExp(tagPattern, 'i') };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Text search matching name, marathi name, tags, description, or category
    if (search) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      const searchRegex = new RegExp(words.join('|'), 'i');
      query.$or = [
        { name: searchRegex },
        { nameMR: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
        { descriptionMR: searchRegex },
        { mainCategory: searchRegex }
      ];
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting definition
    let sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalProducts: total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving products',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      nameMR,
      description,
      descriptionMR,
      mainCategory,
      subCategory,
      price,
      wholesalePrice,
      minWholesaleQuantity,
      stockQuantity,
      imageUrls,
      tags,
      seasonalDiscount
    } = req.body;

    // Basic server-side validation for mandatory fields (Mongoose handles validation too, but this provides clean error responses)
    const requiredFields = { name, description, mainCategory, subCategory, price, wholesalePrice, imageUrls };
    const missingFields = [];
    
    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(key);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const newProduct = new Product({
      name,
      nameMR: nameMR || '',
      description,
      descriptionMR: descriptionMR || '',
      mainCategory,
      subCategory,
      price,
      wholesalePrice,
      minWholesaleQuantity: minWholesaleQuantity || 20,
      stockQuantity: stockQuantity || 0,
      imageUrls,
      tags: tags || [],
      seasonalDiscount
    });

    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: savedProduct
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating product',
      error: error.message
    });
  }
};

/**
 * @desc    Atomically update product stock (concurrency-safe)
 * @route   PUT /api/products/:id/stock
 * @access  Private/Admin (or system automated at checkout)
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body; // Can be positive (restock) or negative (checkout/purchase)

    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'A numeric quantity is required to adjust stock'
      });
    }

    const change = parseInt(quantity, 10);
    let updatedProduct;

    if (change < 0) {
      // Decreasing stock - checkout operation. Prevent negative stock atomically.
      const positiveChangeVal = Math.abs(change);
      updatedProduct = await Product.findOneAndUpdate(
        {
          _id: id,
          stockQuantity: { $gte: positiveChangeVal } // Condition to prevent negative stock
        },
        {
          $inc: { stockQuantity: change }
        },
        { new: true, runValidators: true }
      );
    } else {
      // Increasing stock - cancellation or restock operation.
      updatedProduct = await Product.findOneAndUpdate(
        { _id: id },
        {
          $inc: { stockQuantity: change }
        },
        { new: true, runValidators: true }
      );
    }

    if (!updatedProduct) {
      // Product was either not found, or stock was insufficient for a checkout request
      const productExists = await Product.findById(id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. Cannot deduct ${Math.abs(change)} items from current stock level (${productExists.stockQuantity}).`
      });
    }

    res.status(200).json({
      success: true,
      message: `Stock successfully adjusted by ${change}`,
      data: {
        id: updatedProduct._id,
        name: updatedProduct.name,
        newStockQuantity: updatedProduct.stockQuantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating stock levels',
      error: error.message
    });
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving product details',
      error: error.message
    });
  }
};
