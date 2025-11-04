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
      width: '60px',
      render: (category) => (
        <img
          src={category.image_url || '/placeholder.png'}
          alt={category.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
        />
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (category) => (
        <div className="min-w-0">
          <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{category.name}</p>
          <p className="text-xs text-gray-500 truncate">{category.slug}</p>
        </div>
      )
    },
    {
      key: 'parent_name',
      label: 'Parent',
      render: (category) => (
        <span className="text-xs sm:text-sm text-gray-600 truncate">
          {category.parent_name || '-'}
        </span>
      )
    },
    {
      key: 'product_count',
      label: 'Products',
      sortable: true,
      render: (category) => (
        <span className="px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          {category.product_count || 0}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (category) => (
        <span
          className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${category.is_active
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
      width: '80px',
      render: (category) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Edit"
            aria-label="Edit category"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedCategory(category);
              setShowDeleteModal(true);
            }}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Delete"
            aria-label="Delete category"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Manage product categories</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Add Category</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
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
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
          >
            Clear
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

