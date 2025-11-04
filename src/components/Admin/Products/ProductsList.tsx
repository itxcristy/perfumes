import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable, Column } from '../../Common/DataTable';
import { ConfirmModal } from '../../Common/Modal';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { ProductForm } from './ProductForm';

interface Product {
  id: string;
  name: string;
  price: string;
  original_price: string;
  stock: number;
  category_name: string;
  is_active: boolean;
  images: string[];
  created_at: string;
}

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const pageSize = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await apiClient.get(`/admin/products?${params}`);

      if (response.success) {
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      setDeleteLoading(true);
      await apiClient.delete(`/admin/products/${selectedProduct.id}`);
      showSuccess('Product deleted successfully');
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error: any) {
      showError(error.message || 'Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setShowFormModal(true);
  };

  const handleFormSuccess = () => {
    setShowFormModal(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const columns: Column<Product>[] = [
    {
      key: 'images',
      label: 'Image',
      width: '60px',
      render: (product) => (
        <img
          src={product.images[0] || '/placeholder.png'}
          alt={product.name}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
        />
      )
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (product) => (
        <div className="min-w-0">
          <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500 truncate">{product.category_name}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-semibold text-xs sm:text-sm text-gray-900">₹{Number(product.price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          {product.original_price && (
            <p className="text-xs text-gray-500 line-through">
              ₹{Number(product.original_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (product) => (
        <span
          className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${product.stock === 0
            ? 'bg-red-100 text-red-800'
            : product.stock < 10
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
            }`}
        >
          {product.stock}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (product) => (
        <span
          className={`px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full ${product.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
            }`}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '80px',
      render: (product) => (
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleEdit(product)}
            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Edit"
            aria-label="Edit product"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setSelectedProduct(product);
              setShowDeleteModal(true);
            }}
            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 active:bg-red-100 rounded transition-colors min-h-[44px] sm:min-h-auto flex items-center justify-center"
            title="Delete"
            aria-label="Delete product"
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto flex-shrink-0"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Add Product</span>
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
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          onPageChange: setCurrentPage
        }}
        emptyMessage="No products found"
      />

      {/* Product Form Modal */}
      {showFormModal && (
        <ProductForm
          product={selectedProduct}
          onClose={() => {
            setShowFormModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

