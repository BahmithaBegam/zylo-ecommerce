import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Grid, X, Check } from 'lucide-react';
import { Category } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import api from '../../services/api.js';

export const AdminCategories: React.FC = () => {
  const { success, error } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data?.categories) {
        setCategories(res.data.categories);
      }
    } catch (err: any) {
      error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await api.delete(`/categories/${id}`);
      if (res.data?.success) {
        success('Category deleted.');
        setCategories(categories.filter(c => c._id !== id));
      }
    } catch (err: any) {
      error(err.message || 'Failed to delete category.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
    };

    try {
      if (editingCategory) {
        const res = await api.put(`/categories/${editingCategory._id}`, payload);
        if (res.data?.success) {
          success('Category updated successfully!');
          setCategories(categories.map(c => (c._id === editingCategory._id ? res.data.category : c)));
          setIsModalOpen(false);
        }
      } else {
        const res = await api.post('/categories', payload);
        if (res.data?.success) {
          success('Category created successfully!');
          setCategories([...categories, res.data.category]);
          setIsModalOpen(false);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to save category.');
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            Departments & Categories
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Organize the storefront taxonomy, department images, and product associations
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat._id}
            className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center gap-4">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-16 h-16 rounded-2xl object-cover bg-zinc-100 border border-zinc-200 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-base text-zinc-900 truncate">{cat.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{cat.productCount || 0} Products</p>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{cat.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-2 text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat._id, cat.name)}
                className="p-2 text-zinc-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-zinc-900 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
