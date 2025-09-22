/**
 * Order Management Service for Sufi Essences
 * Handles order lifecycle, status updates, inventory management, and notifications
 */

import { supabase } from '../lib/supabase';
import { emailService } from './emailService';
import { Order, CartItem, OrderStatus } from '../types';

export interface OrderUpdateData {
  status?: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  estimatedDelivery?: string;
}

export interface InventoryUpdate {
  productId: string;
  quantityChange: number;
  reason: 'order_placed' | 'order_cancelled' | 'stock_adjustment' | 'return_processed';
}

class OrderManagementService {
  /**
   * Update order status and send notifications
   */
  async updateOrderStatus(
    orderId: string,
    updateData: OrderUpdateData,
    sendNotification: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current order details
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, email),
          order_items(
            *,
            products(name, images)
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return { success: false, error: 'Order not found' };
      }

      // Update order in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: updateData.status || order.status,
          tracking_number: updateData.trackingNumber || order.tracking_number,
          notes: updateData.notes || order.notes,
          estimated_delivery: updateData.estimatedDelivery || order.estimated_delivery,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      // Log status change
      await this.logOrderStatusChange(orderId, order.status, updateData.status || order.status);

      // Handle inventory updates based on status change
      if (updateData.status && updateData.status !== order.status) {
        await this.handleInventoryOnStatusChange(order, updateData.status);
      }

      // Send notification email if requested
      if (sendNotification && order.profiles?.email) {
        try {
          await emailService.sendOrderStatusUpdateEmail({
            email: order.profiles.email,
            name: order.profiles.full_name || 'Customer',
            orderId: order.id,
            status: updateData.status || order.status,
            trackingNumber: updateData.trackingNumber || order.tracking_number
          });
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          // Don't fail the status update if email fails
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Process order cancellation
   */
  async cancelOrder(
    orderId: string,
    reason: string,
    refundAmount?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get order details
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(product_id, quantity)
        `)
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.status === 'cancelled') {
        return { success: false, error: 'Order is already cancelled' };
      }

      if (order.status === 'delivered') {
        return { success: false, error: 'Cannot cancel delivered order' };
      }

      // Update order status
      const statusUpdate = await this.updateOrderStatus(orderId, {
        status: 'cancelled',
        notes: `Cancelled: ${reason}`
      });

      if (!statusUpdate.success) {
        return statusUpdate;
      }

      // Restore inventory for cancelled items
      for (const item of order.order_items) {
        await this.updateInventory({
          productId: item.product_id,
          quantityChange: item.quantity,
          reason: 'order_cancelled'
        });
      }

      // Log cancellation
      await supabase
        .from('order_audit_log')
        .insert({
          order_id: orderId,
          action: 'cancelled',
          details: { reason, refund_amount: refundAmount },
          created_at: new Date().toISOString()
        });

      return { success: true };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update product inventory
   */
  async updateInventory(update: InventoryUpdate): Promise<void> {
    try {
      // Get current stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', update.productId)
        .single();

      if (fetchError || !product) {
        console.error('Product not found for inventory update:', update.productId);
        return;
      }

      const newStock = Math.max(0, product.stock + update.quantityChange);

      // Update product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.productId);

      if (updateError) {
        console.error('Error updating inventory:', updateError);
        return;
      }

      // Log inventory change
      await supabase
        .from('inventory_log')
        .insert({
          product_id: update.productId,
          quantity_change: update.quantityChange,
          new_stock: newStock,
          reason: update.reason,
          created_at: new Date().toISOString()
        });

      // Check for low stock alerts
      if (newStock <= 5) { // Low stock threshold
        await this.sendLowStockAlert(update.productId, newStock);
      }
    } catch (error) {
      console.error('Error in updateInventory:', error);
    }
  }

  /**
   * Handle inventory changes based on order status
   */
  private async handleInventoryOnStatusChange(order: any, newStatus: OrderStatus): Promise<void> {
    // Only reduce inventory when order is confirmed/paid
    if (newStatus === 'confirmed' || newStatus === 'paid') {
      for (const item of order.order_items) {
        await this.updateInventory({
          productId: item.product_id,
          quantityChange: -item.quantity,
          reason: 'order_placed'
        });
      }
    }
  }

  /**
   * Log order status changes
   */
  private async logOrderStatusChange(
    orderId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    try {
      await supabase
        .from('order_audit_log')
        .insert({
          order_id: orderId,
          action: 'status_changed',
          details: {
            old_status: oldStatus,
            new_status: newStatus,
            timestamp: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging status change:', error);
    }
  }

  /**
   * Send low stock alert to admins
   */
  private async sendLowStockAlert(productId: string, currentStock: number): Promise<void> {
    try {
      // Get product details
      const { data: product } = await supabase
        .from('products')
        .select('name, sku')
        .eq('id', productId)
        .single();

      if (!product) return;

      // Get admin emails
      const { data: admins } = await supabase
        .from('profiles')
        .select('email')
        .eq('role', 'admin')
        .eq('is_active', true);

      if (!admins || admins.length === 0) return;

      // Send alert to each admin
      for (const admin of admins) {
        if (admin.email) {
          // You could create a specific low stock email template
          console.log(`Low stock alert: ${product.name} (${product.sku}) - ${currentStock} remaining`);
          // await emailService.sendLowStockAlert(admin.email, product, currentStock);
        }
      }
    } catch (error) {
      console.error('Error sending low stock alert:', error);
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('orders')
        .select('status, total_amount, created_at');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      // Calculate analytics
      const analytics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        statusBreakdown: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / orders.length 
          : 0
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting order analytics:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get orders with filters
   */
  async getOrdersWithFilters(filters: {
    status?: OrderStatus;
    dateFrom?: string;
    dateTo?: string;
    customerId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(full_name, email, phone),
          order_items(
            *,
            products(name, images, sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.customerId) {
        query = query.eq('user_id', filters.customerId);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data: orders, error } = await query;

      if (error) throw error;

      return { success: true, orders };
    } catch (error) {
      console.error('Error getting orders with filters:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const orderManagementService = new OrderManagementService();
export default orderManagementService;
