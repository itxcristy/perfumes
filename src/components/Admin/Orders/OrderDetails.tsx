import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Truck, Printer, Loader2 } from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import { ConfirmModal } from '../../Common/Modal';

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
        console.log('Invoice data:', response.data);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to retrieve invoice');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrintInvoice}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Printer className="h-5 w-5" />
          <span>Print Invoice</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 pb-4 border-b border-gray-200 last:border-0">
                  <img
                    src={item.product_image || '/placeholder.png'}
                    alt={item.product_name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${Number(item.total_price).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${Number(item.unit_price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${Number(order.subtotal).toFixed(2)}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-${Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900">${Number(order.tax_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">${Number(order.shipping_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-amber-600">${Number(order.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{order.customer_email}</p>
              </div>
              {order.shipping_address && (
                <div>
                  <p className="text-sm text-gray-600">Shipping Address</p>
                  <p className="font-medium text-gray-900">
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
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {newStatus !== order.status && (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    disabled={updating}
                    className="mt-2 w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    Update Status
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => {
                    setNewPaymentStatus(e.target.value);
                    if (e.target.value !== order.payment_status) {
                      handleUpdatePaymentStatus();
                    }
                  }}
                  disabled={updating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {trackingNumber !== order.tracking_number && (
                  <button
                    onClick={handleUpdateTracking}
                    disabled={updating}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Update Tracking
                  </button>
                )}
              </div>
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

