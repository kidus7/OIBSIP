const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Inventory = require('./models/Inventory');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Ensure path defaults to pizza-app database
const MONGO_URI = process.env.MONGO_URI

const inventoryData = [
  // Bases (5)
  { name: 'Thin Crust', category: 'base', price: 3.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Thick Crust', category: 'base', price: 4.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Cheese Burst', category: 'base', price: 5.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Wheat Crust', category: 'base', price: 4.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Gluten Free', category: 'base', price: 6.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },

  // Sauces (5)
  { name: 'Classic Tomato', category: 'sauce', price: 1.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Spicy Schezwan', category: 'sauce', price: 1.75, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Barbeque', category: 'sauce', price: 2.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Creamy Garlic', category: 'sauce', price: 2.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Pesto', category: 'sauce', price: 2.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },

  // Cheeses (3)
  { name: 'Mozzarella', category: 'cheese', price: 2.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Cheddar', category: 'cheese', price: 2.75, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Parmesan', category: 'cheese', price: 3.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },

  // Veggies (5)
  { name: 'Onions', category: 'veggie', price: 1.00, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Bell Peppers', category: 'veggie', price: 1.25, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Mushrooms', category: 'veggie', price: 1.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Olives', category: 'veggie', price: 1.50, stock: 50, minThreshold: 20, unit: 'units', inStock: true },
  { name: 'Jalapenos', category: 'veggie', price: 1.25, stock: 50, minThreshold: 20, unit: 'units', inStock: true },

  // Pre-made Menu Pizzas (6)
  {
    name: 'Margherita Pizza',
    category: 'pre-made',
    description: 'Classic tomato sauce, mozzarella, thin crust',
    price: 12.99,
    imageURL: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  },
  {
    name: 'Pepperoni Feast',
    category: 'pre-made',
    description: 'Spicy schezwan, mozzarella, thick crust, jalapenos',
    price: 15.99,
    imageURL: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  },
  {
    name: 'BBQ Chicken Delight',
    category: 'pre-made',
    description: 'Barbeque sauce, cheddar, cheese burst, onions',
    price: 17.99,
    imageURL: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  },
  {
    name: 'Veggie Paradise',
    category: 'pre-made',
    description: 'Pesto sauce, mozzarella, wheat crust, bell peppers, mushrooms, olives',
    price: 14.99,
    imageURL: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  },
  {
    name: 'Quattro Formaggi',
    category: 'pre-made',
    description: 'Creamy garlic, mozzarella, cheddar, parmesan, gluten free',
    price: 16.99,
    imageURL: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  },
  {
    name: 'Spicy Inferno',
    category: 'pre-made',
    description: 'Spicy schezwan, mozzarella, thin crust, jalapenos, onions, bell peppers',
    price: 15.49,
    imageURL: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=1000&auto=format&fit=crop',
    stock: 50,
    minThreshold: 10,
    unit: 'units',
    inStock: true
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Clear Inventory collection
    await Inventory.deleteMany();
    console.log('📦 Inventory collection cleared.');

    // Seed Inventory items
    await Inventory.insertMany(inventoryData);
    console.log('✅ Inventory & Pre-made pizzas seeded successfully!');

    // Seed Default Admin and Driver Users
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('pass@123!', salt);

    // Upsert Admin User
    await User.findOneAndUpdate(
      { email: 'admin@pizza.com' },
      {
        name: 'Admin User',
        email: 'admin@pizza.com',
        password: defaultPassword,
        role: 'admin',
        isVerified: true
      },
      { upsert: true, new: true }
    );
    console.log('🛡️ Default Admin user seeded (admin@pizza.com)');

    // Upsert Verified Driver User
    await User.findOneAndUpdate(
      { email: 'driver@pizza.com' },
      {
        name: 'Mignot Driver',
        email: 'driver@pizza.com',
        password: defaultPassword,
        phone: '+251912345678',
        role: 'driver',
        isVerified: true,
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('🚗 Default Driver user seeded (driver@pizza.com)');

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();