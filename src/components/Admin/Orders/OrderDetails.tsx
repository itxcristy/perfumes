import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Truck, Printer, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { ConfirmModal } from '../../Common/Modal';
import {
  getOrderStatusConfig,
  getPaymentStatusConfig,
  getPaymentMethodConfig,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  getNextPossibleStatuses,
  OrderStatus
} from '../../../utils/orderStatusUtils';

interface OrderDetailsProps {
  orderId: string;
  onClose: () => void;
}

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  payment_status: string;
  subtotal: string;
  tax_amount: string;
  shipping_amount: string;
  discount_amount: string;
  total_amount: string;
  shipping_address: any;
  billing_address: any;
  tracking_number: string;
  created_at: string;
  items: OrderItem[];
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ orderId, onClose }) => {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/orders/${orderId}`);

      if (response.success) {
        setOrder(response.data);
        setNewStatus(response.data.status);
        setNewPaymentStatus(response.data.payment_status);
        setTrackingNumber(response.data.tracking_number || '');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order || newStatus === order.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setUpdating(true);
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      showSuccess('Order status updated successfully');
      setShowStatusModal(false);
      fetchOrderDetails();
    } catch (error: any) {
      showError(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!order || newPaymentStatus === order.payment_status) return;

    try {
      setUpdating(true);
      await apiClient.patch(`/admin/orders/${orderId}/payment-status`, { payment_status: newPaymentStatus });
      showSuccess('Payment status updated successfully');
      fetchOrderDetails();
    } catch (error: any) {
      showError(error.message || 'Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateTracking = async () => {
    if (!order || trackingNumber === order.tracking_number) return;

    try {
      setUpdating(true);
      await apiClient.patch(`/admin/orders/${orderId}/tracking`, { tracking_number: trackingNumber });
      showSuccess('Tracking number updated successfully');
      fetchOrderDetails();
    } catch (error: any) {
      showError(error.message || 'Failed to update tracking number');
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      const response = await apiClient.get(`/admin/orders/${orderId}/invoice`);
      if (response.success) {
        // In a real app, this would generate a PDF or open a print dialog
        showSuccess('Invoice data retrieved. Print functionality coming soon.');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to retrieve invoice');
    }
  };

  const renderStatusBadge = (status: string, isPayment: boolean = false) => {
    const config = isPayment ? getPaymentStatusConfig(status) : getOrderStatusConfig(status);
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
        <div>
          <p className={`text-sm font-semibold ${config.color}`}>{config.label}</p>
          <p className={`text-xs ${config.color} opacity-75`}>{config.description}</p>
        </div>
      </div>
    );
  };

  const renderPaymentMethod = (method: string) => {
    const config = getPaymentMethodConfig(method);
    const Icon = config.icon;

    return (
      <div className="inline-flex items-center space-x-2 text-gray-700">
        <Icon className="h-5 w-5 text-gray-600" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found</p>
        <button onClick={onClose} className="mt-4 text-amber-600 hover:text-amber-700">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">{order.order_number}</h1>
            <p className="text-xs sm:text-base text-gray-600 mt-1 truncate">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrintInvoice}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-sm sm:text-base min-h-[44px] sm:min-h-auto flex-shrink-0"
        >
          <Printer className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Print Invoice</span>
          <span className="sm:hidden">Print</span>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-3">Order Status</p>
          {renderStatusBadge(order.status, false)}
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 sm:mb-3">Payment Status</p>
          {renderStatusBadge(order.payment_status, true)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              Order Items ({order.items.length})
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200 last:border-0 last:pb-0">
                  <img
                    src={item.product_image || '/placeholder.png'}
                    alt={item.product_name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-base text-gray-900 truncate">{item.product_name}</p>
                    <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-600">
                        Qty: <span className="font-medium text-gray-900">{item.quantity}</span>
                      </span>
                      <span className="text-gray-600">
                        @ <span className="font-medium text-gray-900">₹{Number(item.unit_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-xs sm:text-base text-gray-900">
                      ₹{Number(item.total_price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">₹{Number(order.subtotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600 font-medium">-₹{Number(order.discount_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900 font-medium">₹{Number(order.tax_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">₹{Number(order.shipping_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold pt-2 sm:pt-3 border-t border-gray-200">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-amber-600">₹{Number(order.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Customer Information</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Name</p>
                <p className="font-medium text-xs sm:text-base text-gray-900 truncate">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Email</p>
                <p className="font-medium text-xs sm:text-base text-gray-900 truncate">{order.customer_email}</p>
              </div>
              {order.shipping_address && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Shipping Address</p>
                  <p className="font-medium text-xs sm:text-base text-gray-900 break-words">
                    {order.shipping_address.street_address}<br />
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                    {order.shipping_address.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Manage Order</h2>
            <div className="space-y-4 sm:space-y-6">
              {/* Order Status Update */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Update Order Status
                </label>
                <p className="text-xs text-gray-600 mb-2 sm:mb-3">Current: <span className="font-medium">{getOrderStatusConfig(order.status).label}</span></p>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                >
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
                {newStatus !== order.status && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    disabled={updating}
                    className="mt-2 sm:mt-3 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 transition-colors font-medium text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                  >
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                {/* Payment Status Update */}
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                  Update Payment Status
                </label>
                <p className="text-xs text-gray-600 mb-2 sm:mb-3">Current: <span className="font-medium">{getPaymentStatusConfig(order.payment_status).label}</span></p>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => {
                    setNewPaymentStatus(e.target.value);
                    if (e.target.value !== order.payment_status) {
                      handleUpdatePaymentStatus();
                    }
                  }}
                  disabled={updating}
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 text-xs sm:text-sm"
                >
                  {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                {/* Tracking Number */}
                <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4 flex-shrink-0" />
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g., TRK123456789"
                  className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
                />
                {trackingNumber !== order.tracking_number && (
                  <button
                    onClick={handleUpdateTracking}
                    disabled={updating}
                    className="mt-2 sm:mt-3 w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors font-medium text-xs sm:text-sm min-h-[44px] sm:min-h-auto"
                  >
                    {updating ? 'Updating...' : 'Update Tracking'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4">Payment Method</h3>
            <div className="space-y-2 sm:space-y-3">
              {renderPaymentMethod(order.payment_method)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Confirmation Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleUpdateStatus}
        title="Update Order Status"
        message={`Are you sure you want to change the order status to "${newStatus}"?`}
        confirmText="Update"
        variant="warning"
        loading={updating}
      />
    </div>
  );
};

