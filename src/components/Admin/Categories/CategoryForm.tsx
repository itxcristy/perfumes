import React, { useState, useEffect } from 'react';
import { Modal } from '../../Common/Modal';
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from '../../Common/FormInput';
import { ImageUpload } from '../Common/ImageUpload';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { Loader2 } from 'lucide-react';

interface CategoryFormProps {
  category: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string;
  sort_order: string;
  is_active: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
    sort_order: '0',
    is_active: true
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchCategories();
    
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image_url: category.image_url || '',
        parent_id: category.parent_id || '',
        sort_order: category.sort_order?.toString() || '0',
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    }
  }, [category]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      if (response.success) {
        // Filter out current category and its children to prevent circular references
        const availableCategories = category
          ? response.data.filter((cat: any) => cat.id !== category.id)
          : response.data;
        setCategories(availableCategories);
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
    if (name === 'name' && !category) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }

    if (formData.sort_order && parseInt(formData.sort_order) < 0) {
      newErrors.sort_order = 'Sort order cannot be negative';
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
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        imageUrl: formData.image_url || null,
        parentId: formData.parent_id || null,
        sortOrder: parseInt(formData.sort_order),
        isActive: formData.is_active
      };

      if (category) {
        await apiClient.put(`/categories/${category.id}`, payload);
        showSuccess('Category updated successfully');
      } else {
        await apiClient.post('/categories', payload);
        showSuccess('Category created successfully');
      }

      onSuccess();
    } catch (error: any) {
      showError(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <FormInput
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Enter category name"
          />

          <FormInput
            label="Slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            error={errors.slug}
            required
            helperText="URL-friendly version of the name"
            placeholder="category-slug"
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Category description"
          />
        </div>

        {/* Category Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Category Image</h3>

          <ImageUpload
            value={formData.image_url}
            onChange={(image) => setFormData(prev => ({ ...prev, image_url: Array.isArray(image) ? image[0] : image }))}
            multiple={false}
            label="Upload Category Image"
            helperText="Upload a category image or enter URL below"
          />

          <FormInput
            label="Or Enter Image URL"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            helperText="Direct URL to category image"
          />
        </div>

        {/* Hierarchy & Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Hierarchy & Settings</h3>
          
          <FormSelect
            label="Parent Category"
            name="parent_id"
            value={formData.parent_id}
            onChange={handleChange}
            options={[
              { value: '', label: 'None (Top Level)' },
              ...categories
                .filter(cat => cat.is_active)
                .map(cat => ({ value: cat.id, label: cat.name }))
            ]}
            helperText="Select a parent category to create a subcategory"
          />

          <FormInput
            label="Sort Order"
            name="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={handleChange}
            error={errors.sort_order}
            placeholder="0"
            helperText="Lower numbers appear first"
          />

          <FormCheckbox
            label="Active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
          />
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
            <span>{category ? 'Update Category' : 'Create Category'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

