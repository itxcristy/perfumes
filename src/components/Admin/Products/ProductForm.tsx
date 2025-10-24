import React, { useState, useEffect } from 'react';
import { Modal } from '../../Common/Modal';
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from '../../Common/FormInput';
import { ImageUpload } from '../Common/ImageUpload';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  product: any | null;
  onClose: () => void;
  onSuccess: () => void;
  endpointPrefix?: string; // Add endpoint prefix prop
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  original_price: string;
  category_id: string;
  stock: string;
  min_stock_level: string;
  sku: string;
  is_featured: boolean;
  is_active: boolean;
  images: string[];
}

interface FormErrors {
  [key: string]: string;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess, endpointPrefix = '/admin' }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    original_price: '',
    category_id: '',
    stock: '0',
    min_stock_level: '5',
    sku: '',
    is_featured: false,
    is_active: true,
    images: []
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchCategories();
    
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price || '',
        original_price: product.original_price || '',
        category_id: product.category_id || '',
        stock: product.stock?.toString() || '0',
        min_stock_level: product.min_stock_level?.toString() || '5',
        sku: product.sku || '',
        is_featured: product.is_featured || false,
        is_active: product.is_active !== undefined ? product.is_active : true,
        images: product.images || []
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-generate slug from name
    if (name === 'name' && !product) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }

    if (formData.stock && parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }

    if (formData.original_price && parseFloat(formData.original_price) < parseFloat(formData.price)) {
      newErrors.original_price = 'Original price must be greater than sale price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock),
        min_stock_level: parseInt(formData.min_stock_level),
        images: formData.images
      };

      if (product) {
        await apiClient.put(`${endpointPrefix}/products/${product.id}`, payload);
        showSuccess('Success', 'Product updated successfully');
      } else {
        await apiClient.post(`${endpointPrefix}/products`, payload);
        showSuccess('Success', 'Product created successfully');
      }

      onSuccess();
    } catch (error: any) {
      showError('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <FormInput
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name || ''}
            required
            placeholder="Enter product name"
          />

          <FormInput
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug || ''}
            helperText="URL-friendly version of the name"
            placeholder="product-slug"
          />

          <FormTextarea
            label="Short Description"
            name="short_description"
            value={formData.short_description}
            onChange={handleChange}
            rows={2}
            placeholder="Brief product description"
          />

          <FormTextarea
            label="Full Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Detailed product description"
          />
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              error={errors.price || ''}
              required
              placeholder="0.00"
            />

            <FormInput
              label="Original Price"
              name="original_price"
              type="number"
              step="0.01"
              value={formData.original_price}
              onChange={handleChange}
              error={errors.original_price || ''}
              placeholder="0.00"
              helperText="Leave empty if no discount"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Stock Quantity"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              error={errors.stock || ''}
              required
              placeholder="0"
            />

            <FormInput
              label="Min Stock Level"
              name="min_stock_level"
              type="number"
              value={formData.min_stock_level}
              onChange={handleChange}
              error={''}
              placeholder="5"
              helperText="Low stock alert threshold"
            />

            <FormInput
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              error={''}
              placeholder="PROD-001"
              helperText="Stock Keeping Unit"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>

          <ImageUpload
            value={formData.images}
            onChange={(images) => setFormData(prev => ({ ...prev, images: Array.isArray(images) ? images : [images] }))}
            multiple={true}
            maxFiles={5}
            label="Upload Product Images"
            helperText="Upload up to 5 product images. First image will be the main image."
          />
        </div>

        {/* Category & Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Category & Settings</h3>

          <FormSelect
            label="Category"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            error={errors.category_id || ''}
            required
            options={[
              { value: '', label: 'Select a category' },
              ...categories.map(cat => ({ value: cat.id, label: cat.name }))
            ]}
          />

          <div className="space-y-2">
            <FormCheckbox
              label="Featured Product"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
            />

            <FormCheckbox
              label="Active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{product ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

