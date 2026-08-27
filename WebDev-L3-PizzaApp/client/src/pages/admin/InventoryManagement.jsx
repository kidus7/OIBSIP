import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { inventoryService } from '../../services/inventoryService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Selected category sub-filter tab
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Editing state for inline or modal
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMinThreshold, setEditMinThreshold] = useState('');
  const [editInStock, setEditInStock] = useState(true);

  // New item modal/form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'base',
    stock: 50,
    price: 99,
    minThreshold: 20,
    unit: 'units'
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await inventoryService.getInventory();
      setInventory(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setEditStock(item.stock ?? 0);
    setEditPrice(item.price ?? 0);
    setEditMinThreshold(item.minThreshold ?? 20);
    setEditInStock(item.inStock ?? true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditStock('');
    setEditPrice('');
    setEditMinThreshold('');
    setEditInStock(true);
  };

  const handleSaveUpdate = async (id) => {
    try {
      setError('');
      setSuccessMessage('');
      const updatedData = {
        stock: Number(editStock),
        price: Number(editPrice),
        minThreshold: Number(editMinThreshold),
        inStock: Boolean(editInStock)
      };

      const res = await inventoryService.updateItem(id, updatedData);
      setInventory(inventory.map(item => item._id === id ? res.data : item));
      setSuccessMessage('Inventory item updated successfully!');
      setEditingId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update item');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMessage('');
      const res = await inventoryService.addItem(newItem);
      setInventory([...inventory, res.data]);
      setSuccessMessage('New ingredient added successfully!');
      setShowAddModal(false);
      setNewItem({
        name: '',
        category: 'base',
        stock: 50,
        price: 99,
        minThreshold: 20,
        unit: 'units'
      });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add ingredient');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      setError('');
      await inventoryService.deleteItem(id);
      setInventory(inventory.filter(item => item._id !== id));
      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to delete item');
    }
  };

  // Dynamic category extraction & standard categories (base, sauce, cheese, veggie, pre-made)
  const dynamicCategories = Array.from(new Set(inventory.map(item => item.category)));
  const standardCategories = ['base', 'sauce', 'cheese', 'veggie', 'pre-made'];
  const allCategoryKeys = Array.from(new Set([...standardCategories, ...dynamicCategories]));

  const filteredInventory = selectedCategory === 'all'
    ? inventory
    : inventory.filter(item => item.category === selectedCategory);

  return (
    <AdminLayout title="Inventory Management">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 font-bold">&times;</button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg mb-6 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Ingredient Stock & Prices</h3>
          <p className="text-sm text-slate-500">Manage stock levels, price adjustments, and threshold warnings.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-semibold text-sm shadow transition-colors flex items-center space-x-2 cursor-pointer"
        >
          <span>➕</span>
          <span>Add New Ingredient</span>
        </button>
      </div>

      {/* Category Sub-Filter Pill Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-red-600 text-white shadow'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Items ({inventory.length})
        </button>
        {allCategoryKeys.map(catKey => {
          const count = inventory.filter(i => i.category === catKey).length;
          const label = catKey.charAt(0).toUpperCase() + catKey.slice(1);
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors capitalize cursor-pointer ${
                selectedCategory === catKey
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner fullScreen={false} message="Fetching latest data..." />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="p-4">#</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Threshold</th>
                  <th className="p-4">Status / Alert</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-500">
                      No inventory items found in this category.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => {
                    const isLowStock = (item.stock ?? 0) <= (item.minThreshold ?? 20);
                    const isEditing = editingId === item._id;

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-medium text-slate-500">{index + 1}</td>
                        <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                        <td className="p-4 capitalize text-slate-600">{item.category}</td>
                        
                        {/* Price Column */}
                        <td className="p-4 font-medium text-slate-700">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                              step="0.5"
                            />
                          ) : (
                            `₹${item.price}`
                          )}
                        </td>

                        {/* Current Stock Column */}
                        <td className="p-4 font-medium">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editStock}
                              onChange={(e) => setEditStock(e.target.value)}
                              className="w-24 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            <span className={isLowStock ? 'text-red-600 font-bold' : 'text-slate-800'}>
                              {item.stock} {item.unit || 'units'}
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-slate-500">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editMinThreshold}
                              onChange={(e) => setEditMinThreshold(e.target.value)}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            item.minThreshold || 20
                          )}
                        </td>

                        {/* Warning Badge / Status */}
                        <td className="p-4">
                          {isEditing ? (
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editInStock}
                                onChange={(e) => setEditInStock(e.target.checked)}
                                className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
                              />
                              <span>In Stock</span>
                            </label>
                          ) : (
                            isLowStock ? (
                              <span className="bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full font-bold uppercase border border-red-200">
                                ⚠️ Low Stock
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-semibold uppercase">
                                In Stock
                              </span>
                            )
                          )}
                        </td>

                        {/* Actions Column */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2 whitespace-nowrap">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveUpdate(item._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-semibold rounded-lg shadow cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleStartEdit(item)}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 text-xs font-semibold rounded-lg border border-blue-200 transition-colors cursor-pointer"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Ingredient</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ingredient Name</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Jalapenos, Mozzarella"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 capitalize"
                >
                  <option value="base">Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="veggie">Veggie</option>
                  <option value="pre-made">Pre-Made</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newItem.stock}
                    onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    required
                    value={newItem.minThreshold}
                    onChange={(e) => setNewItem({ ...newItem, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="units / grams / ml"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow cursor-pointer"
                >
                  Add Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
