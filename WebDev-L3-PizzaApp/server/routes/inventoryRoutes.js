const express = require('express');
const {
  getInventory,
  getPreMadePizzas,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
} = require('../controllers/inventoryController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/pre-made', getPreMadePizzas);

router.route('/')
  .get(getInventory)
  .post(protect, admin, addInventoryItem);

router.route('/:id')
  .put(protect, admin, updateInventoryItem)
  .delete(protect, admin, deleteInventoryItem);

module.exports = router;
