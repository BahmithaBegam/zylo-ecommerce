import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  X,
  Check,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Category } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { formatINR } from '../../utils/formatters.js';
import { handleImageError, getCategoryFallback } from '../../utils/imageFallbacks.js';
import api from '../../services/api.js';

export const AdminProducts: React.FC = () => {
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    originalPrice: '',
    discount: '0',
    stock: '',
    sku: '',
    imageUrl: '',
    colors: 'Black, Silver',
    sizes: 'Standard',
    badge: 'Trending',
    freeDelivery: true,
    featured: false,
    bestseller: false,
    newArrival: true,
    warranty: '2-Year Official Manufacturer Warranty',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.get('/products', { params: { limit: 100 } }),
        api.get('/categories'),
      ]);
      if (pRes.data?.success) setProducts(pRes.data.products);
      if (cRes.data?.categories) setCategories(cRes.data.categories);
    } catch (err: any) {
      error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: categories[0]?.name || 'Electronics & Gadgets',
      brand: '',
      price: '',
      originalPrice: '',
      discount: '0',
      stock: '25',
      sku: `ZYLO-${Date.now().toString().slice(-4)}`,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      colors: 'Midnight Black, Sterling Silver',
      sizes: 'Standard',
      badge: 'Best Seller',
      freeDelivery: true,
      featured: false,
      bestseller: false,
      newArrival: true,
      warranty: '2-Year Official Manufacturer Warranty',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand,
      price: String(product.price),
      originalPrice: String(product.originalPrice),
      discount: String(product.discount),
      stock: String(product.stock),
      sku: product.sku,
      imageUrl: product.images[0] || '',
      colors: product.colors.join(', '),
      sizes: product.sizes.join(', '),
      badge: product.badge || '',
      freeDelivery: product.freeDelivery !== false,
      featured: product.featured,
      bestseller: product.bestseller,
      newArrival: product.newArrival,
      warranty: product.warranty || '2-Year Official Manufacturer Warranty',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data?.success) {
        success('Product deleted successfully.');
        setProducts(products.filter(p => p._id !== id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete product.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formData.price);
    const origPriceNum = parseFloat(formData.originalPrice) || priceNum;
    const stockNum = parseInt(formData.stock, 10);
    const discountNum = parseInt(formData.discount, 10) || 0;

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      price: priceNum,
      originalPrice: origPriceNum,
      discount: discountNum,
      stock: stockNum,
      sku: formData.sku.trim(),
      images: [formData.imageUrl.trim()],
      colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      badge: formData.badge.trim(),
      freeDelivery: formData.freeDelivery,
      featured: formData.featured,
      bestseller: formData.bestseller,
      newArrival: formData.newArrival,
      warranty: formData.warranty,
    };

    try {
      if (editingProduct) {
        const res = await api.put(`/products/${editingProduct._id}`, payload);
        if (res.data?.success) {
          success('Product updated successfully!');
          setProducts(products.map(p => (p._id === editingProduct._id ? res.data.product : p)));
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data?.success) {
          success('New product created successfully!');
          setProducts([res.data.product, ...products]);
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save product.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Product Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage catalogue items, stock thresholds, pricing, and variants
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, brand, SKU..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Product</th>
                <th className="py-4 px-4">Category & SKU</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">Stock</th>
                <th className="py-4 px-4">Badges</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredProducts.map(p => (
                <tr key={p._id} className="hover:bg-zinc-50/60 transition-colors">
                  {/* Thumbnail & Title */}
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0] || getCategoryFallback(p.category)}
                        alt={p.name}
                        onError={(e) => handleImageError(e, p.category)}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
                      />
                      <div className="min-w-0 max-w-xs">
                        <span className="font-bold text-zinc-900 line-clamp-1">{p.name}</span>
                        <span className="text-[11px] text-zinc-400 font-medium">{p.brand}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category & SKU */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-zinc-700">{p.category}</div>
                    <div className="text-[11px] text-zinc-400 font-mono">{p.sku}</div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <div className="font-black text-zinc-900">{formatINR(p.price)}</div>
                    {p.discount > 0 && (
                      <span className="text-[10px] text-rose-600 font-bold">-{p.discount}% OFF</span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    {p.stock <= 5 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                        Critical: {p.stock}
                      </span>
                    ) : p.stock <= 15 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Low: {p.stock}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.stock} in stock
                      </span>
                    )}
                  </td>

                  {/* Badges */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.bestseller && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
                          Bestseller
                        </span>
                      )}
                      {p.featured && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        className="p-1.5 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black text-zinc-900 mb-1">
              {editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              Configure product specifications, pricing, inventory stock, and variations.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Department / Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none font-bold"
                  >
                    {categories.map(c => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Original MSRP Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Inventory Units in Stock *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">SKU Barcode Reference *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none font-mono focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Primary Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Color Options (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={e => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Black, Silver, Gold"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Size Options (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL or Standard"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Custom Highlight Badge (e.g. Best Seller, Lowest Price, 50% OFF)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Best Seller, Lowest Price, Hot Deal..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                {/* Toggles */}
                <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    Featured on Home
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bestseller}
                      onChange={e => setFormData({ ...formData, bestseller: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    Bestseller Badge
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newArrival}
                      onChange={e => setFormData({ ...formData, newArrival: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    New Arrival Badge
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
