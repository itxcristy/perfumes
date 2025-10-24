import React, { useEffect, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import { DataTable, Column } from '../../Common/DataTable';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { OrderDetails } from './OrderDetails';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { showError } = useNotification();

  const pageSize = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(paymentStatusFilter && { paymentStatus: paymentStatusFilter })
      });

      const response = await apiClient.get(`/admin/orders?${params}`);
      
      if (response.success) {
        setOrders(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true,
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">{order.order_number}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (order) => (
        <div>
          <p className="font-medium text-gray-900">{order.customer_name}</p>
          <p className="text-xs text-gray-500">{order.customer_email}</p>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Total',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-gray-900">
          ${Number(order.total_amount).toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      )
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (order) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
          {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      render: (order) => (
        <button
          onClick={() => setSelectedOrderId(order.id)}
          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      )
    }
  ];

  if (selectedOrderId) {
    return (
      <OrderDetails
        orderId={selectedOrderId}
        onClose={() => {
          setSelectedOrderId(null);
          fetchOrders();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPaymentStatusFilter('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage,
          totalPages,
          pageSize,
          totalItems,
          onPageChange: setCurrentPage
        }}
        emptyMessage="No orders found"
      />
    </div>
  );
};

