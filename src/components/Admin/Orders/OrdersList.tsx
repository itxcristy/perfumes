import React, { useEffect, useState } from 'react';
import { Search, Eye, Filter, X, TrendingUp } from 'lucide-react';
import { DataTable, Column } from '../../Common/DataTable';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { OrderDetails } from './OrderDetails';
import {
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getPaymentMethodConfig,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  OrderStatus,
  PaymentStatus
} from '../../../utils/orderStatusUtils';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  item_count?: number;
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
  const { showNotification } = useNotification();

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
      showNotification({
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to load orders'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string, isPayment: boolean = false) => {
    const config = isPayment ? getPaymentStatusConfig(status) : getOrderStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs sm:text-sm font-medium ${config.bgColor} ${config.borderColor}`}>
        <Icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${config.color}`} />
        <span className={`${config.color} truncate`}>{config.label}</span>
      </div>
    );
  };

  const renderPaymentMethod = (method: string) => {
    const config = getPaymentMethodConfig(method);
    const Icon = config.icon;

    return (
      <div className="inline-flex items-center gap-1 sm:gap-1.5">
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
        <span className="text-xs sm:text-sm text-gray-700 truncate">{config.label}</span>
      </div>
    );
  };

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      label: 'Order #',
      sortable: true,
      render: (order) => (
        <div className="space-y-1">
          <p className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{order.order_number}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      )
    },
    {
      key: 'customer_name',
      label: 'Customer',
      render: (order) => (
        <div className="space-y-1 min-w-0">
          <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{order.customer_name}</p>
          <p className="text-xs text-gray-500 truncate">{order.customer_email}</p>
        </div>
      )
    },
    {
      key: 'total_amount',
      label: 'Amount',
      sortable: true,
      render: (order) => (
        <div className="space-y-1">
          <p className="font-semibold text-xs sm:text-sm text-gray-900">
            ₹{Number(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </p>
          {order.item_count && (
            <p className="text-xs text-gray-500">{order.item_count} item{order.item_count !== 1 ? 's' : ''}</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Order Status',
      render: (order) => renderStatusBadge(order.status, false)
    },
    {
      key: 'payment_status',
      label: 'Payment',
      render: (order) => (
        <div className="space-y-1.5">
          <div>{renderPaymentMethod(order.payment_method)}</div>
          <div>{renderStatusBadge(order.payment_status, true)}</div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '60px',
      render: (order) => (
        <button
          onClick={() => setSelectedOrderId(order.id)}
          className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 text-amber-600 hover:bg-amber-50 active:bg-amber-100 rounded-lg transition-colors min-h-[44px] sm:min-h-auto"
          title="View Details"
          aria-label="View order details"
        >
          <Eye className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs font-medium hidden sm:inline">View</span>
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-xs sm:text-base text-gray-600 mt-1">Manage customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">Filters</h3>
          </div>
          {(searchTerm || statusFilter || paymentStatusFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentStatusFilter('');
                setCurrentPage(1);
              }}
              className="text-xs text-amber-600 hover:text-amber-700 active:text-amber-800 font-medium flex items-center gap-1 flex-shrink-0"
            >
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Clear All</span>
              <span className="sm:hidden">Clear</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search order..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
          >
            <option value="">Order Status</option>
            {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
          >
            <option value="">Payment Status</option>
            {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          <div className="flex items-center justify-end sm:justify-start">
            <span className="text-xs text-gray-600">
              {totalItems > 0 ? `${totalItems} order${totalItems !== 1 ? 's' : ''}` : 'No orders'}
            </span>
          </div>
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