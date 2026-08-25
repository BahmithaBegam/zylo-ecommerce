import { Request, Response } from 'express';
import { db, CategoryDoc } from '../db.js';
import { isCategoryMatch, normalizeCategory } from '../utils/categoryUtils.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categoriesWithCount = db.categories.map(c => {
      const count = db.products.filter(p => isCategoryMatch(p.category, c.name)).length;
      return {
        ...c,
        productCount: count,
      };
    });

    return res.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const cat = db.categories.find(
      c => c.slug === slug || isCategoryMatch(c.name, slug) || c.name.toLowerCase() === slug.toLowerCase()
    );

    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const count = db.products.filter(p => isCategoryMatch(p.category, cat.name)).length;
    return res.json({
      success: true,
      category: {
        ...cat,
        productCount: count,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve category details.' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, iconName, subcategories } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'Name and image are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = db.categories.find(c => c.name.toLowerCase() === name.toLowerCase() || c.slug === slug);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists.' });
    }

    const newCategory: CategoryDoc = {
      _id: `cat_${Date.now()}`,
      name: name.trim(),
      slug,
      description: description || '',
      image,
      iconName: iconName || 'Sparkles',
      subcategories: subcategories || [],
    };

    db.categories.push(newCategory);
    return res.status(201).json({ success: true, message: 'Category created successfully.', category: newCategory });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const catIndex = db.categories.findIndex(c => c._id === id || c.slug === id);

    if (catIndex === -1) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    db.categories[catIndex] = {
      ...db.categories[catIndex],
      ...req.body,
    };

    return res.json({ success: true, message: 'Category updated successfully.', category: db.categories[catIndex] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.categories.length;
    db.categories = db.categories.filter(c => c._id !== id && c.slug !== id);

    if (db.categories.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
