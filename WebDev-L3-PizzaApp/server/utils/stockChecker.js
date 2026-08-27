const cron = require('node-cron');
const Inventory = require('../models/Inventory');
const sendEmail = require('./sendEmail');

const checkLowStock = async () => {
  try {
    console.log('Running low-inventory threshold check...');
    const threshold = Number(process.env.LOW_STOCK_THRESHOLD) || 10;
    const lowStockItems = await Inventory.find({
      category: { $in: ['base', 'sauce', 'cheese', 'veggie'] },
      stock: { $lte: threshold }
    });

    if (lowStockItems.length > 0) {
      const itemList = lowStockItems
        .map(item => `- ${item.name} (${item.category}): ${item.stock} ${item.unit || 'units'} left`)
        .join('\n');

      console.warn(`⚠️ LOW STOCK WARNING:\n${itemList}`);

      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@pizzaapp.com';
      if (adminEmail) {
        await sendEmail({
          email: adminEmail,
          subject: '🚨 Urgent: PizzaApp Low Stock Inventory Alert!',
          message: `Hello Admin,\n\nThe following pizza ingredients have fallen below the low-stock threshold (${threshold} units):\n\n${itemList}\n\nPlease restock inventory immediately to avoid order fulfillment issues.\n\nBest regards,\nPizzaApp Automated System`
        });
      }
    }
  } catch (error) {
    console.error('Error in low stock checker:', error);
  }
};

exports.checkLowStock = checkLowStock;

exports.initStockChecker = () => {
  // Run every day at midnight (0 0 * * *)
  // cron.schedule('*/2 * * * *', async () => {
  cron.schedule('0 0 * * *', async () => {
    await checkLowStock();
  });
};
