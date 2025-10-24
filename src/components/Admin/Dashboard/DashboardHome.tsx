import React, { useEffect, useState } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { apiClient } from '../../../lib/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';

interface DashboardMetrics {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  newUsersToday: number;
  ordersToday: number;
  revenueToday: number;
}

interface TopProduct {
  id: string;
  name: string;
  price: string;
  images: string[];
  stock: number;
  total_sold: string;
}

interface RecentOrder {
  id: string;
  order_number: string;
  total_amount: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  min_stock_level: number;
  price: string;
  images: string[];
}

export const DashboardHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const { showError } = useNotification();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/analytics/dashboard');
      
      if (response.success) {
        setMetrics(response.data.metrics);
        setTopProducts(response.data.topProducts || []);
        setRecentOrders(response.data.recentOrders || []);
        setLowStockProducts(response.data.lowStockProductsList || []);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = metrics ? [
    {
      title: 'Total Revenue',
      value: `$${Number(metrics.totalRevenue).toFixed(2)}`,
      change: metrics.revenueToday > 0 ? `+$${Number(metrics.revenueToday).toFixed(2)} today` : 'No sales today',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: metrics.revenueToday > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toString(),
      change: `${metrics.ordersToday} orders today`,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      trend: metrics.ordersToday > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Products',
      value: metrics.totalProducts.toString(),
      change: `${metrics.lowStockProducts} low stock`,
      icon: Package,
      color: 'bg-purple-500',
      trend: metrics.lowStockProducts > 0 ? 'down' : 'neutral'
    },
    {
      title: 'Total Users',
      value: metrics.totalUsers.toString(),
      change: `${metrics.newUsersToday} new today`,
      icon: Users,
      color: 'bg-amber-500',
      trend: metrics.newUsersToday > 0 ? 'up' : 'neutral'
    }
  ] : [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-sm">
                  {stat.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {stat.trend === 'down' && (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {metrics && (metrics.pendingOrders > 0 || metrics.lowStockProducts > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.pendingOrders > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-900">Pending Orders</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {metrics.pendingOrders} orders waiting to be processed.
                </p>
              </div>
            </div>
          )}
          {metrics.lowStockProducts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">Low Stock Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  {metrics.lowStockProducts} products are running low on stock.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
          </div>
          <div className="p-6">
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">${Number(product.price).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{product.total_sold} sold</p>
                      <p className="text-xs text-gray-500">{product.stock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No sales data available</p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500 truncate">{order.customer_name || order.customer_email}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-semibold text-gray-900">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Products</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <img
                    src={product.images[0] || '/placeholder.png'}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-red-600 font-semibold">
                      Only {product.stock} left (Min: {product.min_stock_level})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

