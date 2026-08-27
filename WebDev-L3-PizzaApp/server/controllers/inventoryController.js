const Inventory = require('../models/Inventory');

// @desc    Get all inventory items (for Custom Pizza Builder & Admin)
// @route   GET /api/v1/inventory
// @access  Public / Private
exports.getInventory = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    const items = await Inventory.find(query);
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pre-made menu pizzas
// @route   GET /api/v1/inventory/pre-made
// @access  Public
exports.getPreMadePizzas = async (req, res, next) => {
  try {
    const items = await Inventory.find({ category: 'pre-made' });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Add inventory item (Admin)
// @route   POST /api/v1/inventory
// @access  Private/Admin
exports.addInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item / manual stock update (Admin)
// @route   PUT /api/v1/inventory/:id
// @access  Private/Admin
exports.updateInventoryItem = async (req, res, next) => {
  try {
    let item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item (Admin)
// @route   DELETE /api/v1/inventory/:id
// @access  Private/Admin
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    await item.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
