import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { DataTable, Column } from '../../Common/DataTable';
import { ConfirmModal } from '../../Common/Modal';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { CategoryForm } from './CategoryForm';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string | null;
  parent_name: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

export const CategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, [searchTerm, statusFilter]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/categories');
      
      if (response.success) {
        let filteredCategories = response.data;

        // Apply search filter
        if (searchTerm) {
          filteredCategories = filteredCategories.filter((cat: Category) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply status filter
        if (statusFilter) {
          const isActive = statusFilter === 'active';
          filteredCategories = filteredCategories.filter((cat: Category) => cat.is_active === isActive);
        }

        setCategories(filteredCategories);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setDeleteLoading(true);
      await apiClient.delete(`/categories/${selectedCategory.id}`);
      showSuccess('Category deleted successfully');
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      showError(error.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedCategory(null);
    fetchCategories();
  };

  const columns: Column<Category>[] = [
    {
      key: 'image_url',
      label: 'Image',
      width: '80px',
      render: (category) => (
        <img
          src={category.image_url || '/placeholder.png'}
          alt={category.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (category) => (
        <div>
          <p className="font-medium text-gray-900">{category.name}</p>
          <p className="text-xs text-gray-500">{category.slug}</p>
        </div>
      )
    },
    {
      key: 'parent_name',
      label: 'Parent Category',
      render: (category) => (
        <span className="text-sm text-gray-600">
          {category.parent_name || '-'}
        </span>
      )
    },
    {
      key: 'product_count',
      label: 'Products',
      sortable: true,
      render: (category) => (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {category.product_count || 0}
        </span>
      )
    },
    {
      key: 'sort_order',
      label: 'Order',
      sortable: true,
      render: (category) => (
        <span className="text-sm text-gray-600">{category.sort_order}</span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (category) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            category.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {category.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedCategory(category);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        emptyMessage="No categories found"
      />

      {/* Category Form Modal */}
      {showFormModal && (
        <CategoryForm
          category={selectedCategory}
          onClose={() => {
            setShowFormModal(false);
            setSelectedCategory(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

