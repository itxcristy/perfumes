import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, ChevronDown, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../../contexts/NotificationContext';
import { apiClient } from '../../../lib/apiClient';

export const CustomerOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { showError } = useNotification();

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      showError('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', name: 'All Orders', count: orders.length },
    { id: 'processing', name: 'Processing', count: orders.filter(o => o.status === 'processing').length },
    { id: 'shipped', name: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
    { id: 'delivered', name: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  const filteredOrders = activeTab === 'all' ? orders : orders.filter(order => order.status === activeTab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'shipped': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
          <p className="text-sm text-gray-600">Manage and track your orders</p>
        </div>
      </div>

      <div className="p-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-indigo-500 text-indigo-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.1 }} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div 
                  className="bg-gray-50 px-6 py-4 border-b border-gray-200 cursor-pointer"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Order #{order.order_number || order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <span className="text-lg font-bold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN') || order.total?.toLocaleString('en-IN') || '0'}</span>
                      <motion.div animate={{ rotate: expandedOrderId === order.id ? 180 : 0 }}>
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedOrderId === order.id && (
                    <motion.div 
                      initial="collapsed" 
                      animate="open" 
                      exit="collapsed" 
                      variants={{
                        open: { opacity: 1, height: 'auto' },
                        collapsed: { opacity: 0, height: 0 }
                      }} 
                      transition={{ duration: 0.3, ease: 'easeInOut' }} 
                      className="overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                            <div className="space-y-3">
                              {order.items && order.items.map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex items-center space-x-3">
                                  {item.product?.images?.[0] ? (
                                    <img 
                                      src={item.product.images[0]} 
                                      alt={item.product.name} 
                                      className="h-12 w-12 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.unit_price?.toLocaleString('en-IN') || '0'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{order.subtotal?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-medium">₹{order.shipping_amount?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span className="font-medium">₹{order.tax_amount?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                              <div className="border-t border-gray-200 pt-2 flex justify-between">
                                <span className="font-medium text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN') || order.total?.toLocaleString('en-IN') || '0'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-end">
                          {order.items && order.items[0] && order.items[0].product && (
                            <button className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                              <Edit className="h-4 w-4" />
                              <span>Write a Review</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};