import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { db, ProductDoc } from '../db.js';
import { ProductModel, ReviewModel } from '../models/index.js';
import { validateProductImages } from '../utils/imageValidator.js';
import { isCategoryMatch, normalizeCategory } from '../utils/categoryUtils.js';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      minRating,
      minDiscount,
      inStock,
      featured,
      bestseller,
      newArrival,
      flashDeal,
      fabric,
      occasion,
      pattern,
      ageGroup,
      toyType,
      sortBy = 'featured',
      page = '1',
      limit = '24',
    } = req.query;

    let filtered = [...db.products];

    // Search
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.fabric && p.fabric.toLowerCase().includes(q))
      );
    }

    // Category (Unified matching for 'Home & Living', 'home-living', 'Sarees', etc.)
    if (category && typeof category === 'string' && category !== 'all') {
      filtered = filtered.filter(p => isCategoryMatch(p.category, category));
    }

    // Subcategory
    if (subcategory && typeof subcategory === 'string') {
      const subLower = subcategory.toLowerCase().trim();
      filtered = filtered.filter(p => p.subcategory && p.subcategory.toLowerCase().includes(subLower));
    }

    // Brand
    if (brand && typeof brand === 'string') {
      const brandsList = brand.split(',').map(b => b.trim().toLowerCase());
      filtered = filtered.filter(p => brandsList.includes(p.brand.toLowerCase()));
    }

    // Sarees-specific filters
    if (fabric && typeof fabric === 'string') {
      const fabricsList = fabric.split(',').map(f => f.trim().toLowerCase());
      filtered = filtered.filter(p => p.fabric && fabricsList.includes(p.fabric.toLowerCase()));
    }

    if (occasion && typeof occasion === 'string') {
      const occasionsList = occasion.split(',').map(o => o.trim().toLowerCase());
      filtered = filtered.filter(p => p.occasion && occasionsList.includes(p.occasion.toLowerCase()));
    }

    if (pattern && typeof pattern === 'string') {
      const patternLower = pattern.toLowerCase().trim();
      filtered = filtered.filter(p => p.pattern && p.pattern.toLowerCase().includes(patternLower));
    }

    // Kids & Toys specific filters
    if (ageGroup && typeof ageGroup === 'string') {
      const ageList = ageGroup.split(',').map(a => a.trim().toLowerCase());
      filtered = filtered.filter(p => p.ageGroup && ageList.includes(p.ageGroup.toLowerCase()));
    }

    if (toyType && typeof toyType === 'string') {
      const toyList = toyType.split(',').map(t => t.trim().toLowerCase());
      filtered = filtered.filter(p => p.toyType && toyList.includes(p.toyType.toLowerCase()));
    }

    // Price range
    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (!isNaN(min)) filtered = filtered.filter(p => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (!isNaN(max)) filtered = filtered.filter(p => p.price <= max);
    }

    // Rating
    if (minRating) {
      const rating = parseFloat(minRating as string);
      if (!isNaN(rating)) filtered = filtered.filter(p => p.rating >= rating);
    }

    // Discount
    if (minDiscount) {
      const disc = parseFloat(minDiscount as string);
      if (!isNaN(disc)) filtered = filtered.filter(p => p.discount >= disc);
    }

    // Stock availability
    if (inStock === 'true') {
      filtered = filtered.filter(p => p.stock > 0);
    }

    // Badge flags
    if (featured === 'true') filtered = filtered.filter(p => p.featured);
    if (bestseller === 'true') filtered = filtered.filter(p => p.bestseller);
    if (newArrival === 'true') filtered = filtered.filter(p => p.newArrival);
    if (flashDeal === 'true') filtered = filtered.filter(p => p.isFlashDeal);

    // Sorting
    switch (sortBy) {
      case 'price_asc':
      case 'price-low-to-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
      case 'price-high-to-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating_desc':
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount_desc':
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    // Facets computation
    const brandsSet = new Set<string>();
    const fabricsSet = new Set<string>();
    const occasionsSet = new Set<string>();
    const ageGroupsSet = new Set<string>();
    const toyTypesSet = new Set<string>();

    filtered.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
      if (p.fabric) fabricsSet.add(p.fabric);
      if (p.occasion) occasionsSet.add(p.occasion);
      if (p.ageGroup) ageGroupsSet.add(p.ageGroup);
      if (p.toyType) toyTypesSet.add(p.toyType);
    });

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 24));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        total,
        page: pageNum,
        totalPages,
        limit: limitNum,
        hasMore: pageNum < totalPages,
      },
      facets: {
        brands: Array.from(brandsSet).sort(),
        fabrics: Array.from(fabricsSet).sort(),
        occasions: Array.from(occasionsSet).sort(),
        ageGroups: Array.from(ageGroupsSet).sort(),
        toyTypes: Array.from(toyTypesSet).sort(),
        categories: db.categories.map(c => ({
          name: c.name,
          slug: c.slug,
          subcategories: c.subcategories || [],
          count: db.products.filter(p => p.category.toLowerCase() === c.name.toLowerCase()).length,
        })),
        priceMin: filtered.length > 0 ? Math.min(...filtered.map(p => p.price)) : 0,
        priceMax: filtered.length > 0 ? Math.max(...filtered.map(p => p.price)) : 10000,
      },
    });
  } catch (err: any) {
    console.error('Error in getProducts:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products' });
  }
};

export const getProductByIdOrSlug = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product = db.products.find(
      p => p._id === id || p.slug === id || p.sku === id || p.slug?.toLowerCase() === id?.toLowerCase()
    );

    if (!product && mongoose.connection.readyState === 1) {
      const mongoProduct = await (ProductModel as any).findOne({
        $or: [{ _id: id }, { slug: id }, { sku: id }],
      }).lean();
      if (mongoProduct) {
        product = mongoProduct as any;
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch related products
    const relatedProducts = db.products
      .filter(p => p._id !== product!._id && p.category?.toLowerCase() === product!.category?.toLowerCase())
      .slice(0, 8);

    // Fetch reviews
    let reviews = db.reviews.filter(r => r.productId === product!._id && r.status === 'approved');
    if (reviews.length === 0 && mongoose.connection.readyState === 1) {
      const mongoReviews = await (ReviewModel as any).find({ productId: product!._id, status: 'approved' }).lean();
      if (mongoReviews && mongoReviews.length > 0) {
        reviews = mongoReviews as any;
      }
    }

    return res.json({
      success: true,
      product,
      relatedProducts,
      reviews,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.category || !data.price || !data.images || data.images.length === 0) {
      return res.status(400).json({ success: false, message: 'Name, category, price, and at least one image are required.' });
    }

    const imagesArray = Array.isArray(data.images) ? data.images : [data.images];
    const primaryImage = imagesArray[0]?.trim();

    // Check for duplicate primary image across catalog
    if (primaryImage) {
      const existingProduct = db.products.find(p => p.images && p.images[0] && p.images[0].trim() === primaryImage);
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: `Duplicate image rejected: This primary image URL is already in use by product "${existingProduct.name}" (SKU: ${existingProduct.sku}). Every product must have a unique primary image.`,
        });
      }
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const sku = data.sku || `ZYLO-${data.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const originalPrice = data.originalPrice || Math.round(data.price * 1.5);
    const discount = data.discount || Math.round(((originalPrice - data.price) / originalPrice) * 100);

    const newProduct: ProductDoc = {
      _id: newId,
      name: data.name.trim(),
      slug,
      description: data.description || `${data.name} - Premium quality selection from Zylo.`,
      category: data.category,
      subcategory: data.subcategory || '',
      brand: data.brand || 'Zylo Collection',
      price: Number(data.price),
      originalPrice: Number(originalPrice),
      discount: Number(discount),
      images: imagesArray,
      stock: Number(data.stock ?? 25),
      sku,
      colors: data.colors || ['Standard'],
      sizes: data.sizes || ['Standard'],
      specifications: data.specifications || {},
      features: data.features || ['Premium quality materials', 'Guaranteed authentic item'],
      warranty: data.warranty || '1-Year Official Brand Warranty',
      rating: 4.5,
      reviewCount: 0,
      featured: Boolean(data.featured),
      bestseller: Boolean(data.bestseller),
      newArrival: Boolean(data.newArrival ?? true),
      freeDelivery: Boolean(data.freeDelivery ?? true),
      badge: data.badge || 'New Arrival',
      fabric: data.fabric,
      occasion: data.occasion,
      pattern: data.pattern,
      ageGroup: data.ageGroup,
      gender: data.gender,
      toyType: data.toyType,
      isFlashDeal: Boolean(data.isFlashDeal),
      dealType: data.dealType,
      createdAt: new Date().toISOString(),
    };

    db.products.unshift(newProduct);
    db.syncProductToMongo(newProduct).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProduct,
    });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productIndex = db.products.findIndex(p => p._id === id || p.slug === id);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const current = db.products[productIndex];
    const updateData = req.body;

    // Check for duplicate primary image if images array is being updated
    if (updateData.images && Array.isArray(updateData.images) && updateData.images.length > 0) {
      const newPrimary = updateData.images[0]?.trim();
      if (newPrimary) {
        const existingProduct = db.products.find(
          p => p._id !== current._id && p.images && p.images[0] && p.images[0].trim() === newPrimary
        );
        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: `Duplicate image rejected: This primary image URL is already in use by product "${existingProduct.name}" (SKU: ${existingProduct.sku}).`,
          });
        }
      }
    }

    const updated: ProductDoc = {
      ...current,
      ...updateData,
      price: updateData.price !== undefined ? Number(updateData.price) : current.price,
      originalPrice: updateData.originalPrice !== undefined ? Number(updateData.originalPrice) : current.originalPrice,
      stock: updateData.stock !== undefined ? Number(updateData.stock) : current.stock,
      discount: updateData.discount !== undefined ? Number(updateData.discount) : current.discount,
      featured: updateData.featured !== undefined ? Boolean(updateData.featured) : current.featured,
      bestseller: updateData.bestseller !== undefined ? Boolean(updateData.bestseller) : current.bestseller,
      newArrival: updateData.newArrival !== undefined ? Boolean(updateData.newArrival) : current.newArrival,
      isFlashDeal: updateData.isFlashDeal !== undefined ? Boolean(updateData.isFlashDeal) : current.isFlashDeal,
    };

    db.products[productIndex] = updated;
    db.syncProductToMongo(updated).catch(console.error);

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = db.products.length;
    db.products = db.products.filter(p => p._id !== id && p.slug !== id);

    if (db.products.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

export const validateImages = async (req: Request, res: Response) => {
  try {
    const report = validateProductImages(db.products);
    return res.json({
      success: true,
      report,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Failed to validate product images.' });
  }
};
