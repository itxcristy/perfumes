import { BaseService } from './BaseService';
import { Order, OrderItem, Address } from '../../types';

/**
 * Order service handling all order-related operations
 */
export class NewOrderService extends BaseService {
  /**
   * Create order for authenticated user
   */
  async createOrder(orderData: {
    items: any[];
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: string;
  }): Promise<string | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.18; // 18% GST for India
      const shippingAmount = subtotal > 500 ? 0 : 50; // Fast Shipping over ₹500
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = 'ORD' + Date.now().toString();

      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          payment_method: orderData.paymentMethod,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.billingAddress || orderData.shippingAddress,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: data.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return data.id;
    } catch (error) {
      this.handleError(error, 'Create Order');
      return null; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
  }

  /**
   * Create guest order
   */
  async createGuestOrder(orderData: {
    items: any[];
    shippingAddress: Address;
    paymentMethod: string;
    guestEmail: string;
    guestName: string;
    paymentId?: string;
  }): Promise<string | null> {
    try {
      // Validate required fields
      this.validateRequired(orderData, ['guestEmail', 'guestName']);
      this.validateEmail(orderData.guestEmail);

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxAmount = subtotal * 0.18; // 18% GST for India
      const shippingAmount = subtotal > 500 ? 0 : 50; // Fast Shipping over ₹500
      const totalAmount = subtotal + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = 'ORD' + Date.now().toString();

      const { data, error } = await this.supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          guest_email: orderData.guestEmail,
          guest_name: orderData.guestName,
          subtotal: subtotal,
          tax_amount: taxAmount,
          shipping_amount: shippingAmount,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: orderData.paymentId ? 'paid' : 'pending',
          payment_method: orderData.paymentMethod,
          payment_id: orderData.paymentId,
          shipping_address: orderData.shippingAddress,
          billing_address: orderData.shippingAddress,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: data.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return data.id;
    } catch (error) {
      this.handleError(error, 'Create Guest Order');
      return null; // This line will never be reached due to handleError throwing, but TypeScript needs it
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      if (!orderId) {
        throw new Error('Order ID is required');
      }

      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(name, image_url)),
          profiles(full_name, email)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        orderNumber: data.order_number,
        userId: data.user_id,
        status: data.status,
        paymentStatus: data.payment_status,
        totalAmount: parseFloat(data.total_amount),
        subtotal: parseFloat(data.subtotal),
        taxAmount: parseFloat(data.tax_amount),
        shippingAmount: parseFloat(data.shipping_amount),
        discountAmount: data.discount_amount ? parseFloat(data.discount_amount) : undefined,
        paymentMethod: data.payment_method,
        paymentId: data.payment_id,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        trackingNumber: data.tracking_number,
        shippedAt: data.shipped_at ? new Date(data.shipped_at) : undefined,
        deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
        notes: data.notes,
        currency: data.currency,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        items: data.order_items || [],
        trackingHistory: data.tracking_history || []
      };
    } catch (error) {
      return this.handleError(error, 'Get Order By ID');
    }
  }

  /**
   * Get orders for a user
   */
  async getUserOrders(userId?: string): Promise<Order[]> {
    try {
      // Get user ID if not provided
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        userId = user.id;
      }

      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(name, image_url))
        `)
        .or(`user_id.eq.${userId},guest_email.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        orderNumber: item.order_number,
        userId: item.user_id,
        status: item.status,
        paymentStatus: item.payment_status,
        totalAmount: parseFloat(item.total_amount),
        subtotal: parseFloat(item.subtotal),
        taxAmount: parseFloat(item.tax_amount),
        shippingAmount: parseFloat(item.shipping_amount),
        discountAmount: item.discount_amount ? parseFloat(item.discount_amount) : undefined,
        paymentMethod: item.payment_method,
        paymentId: item.payment_id,
        shippingAddress: item.shipping_address,
        billingAddress: item.billing_address,
        trackingNumber: item.tracking_number,
        shippedAt: item.shipped_at ? new Date(item.shipped_at) : undefined,
        deliveredAt: item.delivered_at ? new Date(item.delivered_at) : undefined,
        notes: item.notes,
        currency: item.currency,
        createdAt: new Date(item.created_at),
        updatedAt: item.updated_at ? new Date(item.updated_at) : undefined,
        items: item.order_items || [],
        trackingHistory: item.tracking_history || []
      }));
    } catch (error) {
      return this.handleError(error, 'Get User Orders');
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    try {
      if (!orderId) throw new Error('Order ID is required');
      if (!status) throw new Error('Status is required');

      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const { data, error } = await this.supabase
        .from('orders')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select(`
          *,
          order_items(*, products(name, image_url)),
          profiles(full_name, email)
        `)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        orderNumber: data.order_number,
        userId: data.user_id,
        status: data.status,
        paymentStatus: data.payment_status,
        totalAmount: parseFloat(data.total_amount),
        subtotal: parseFloat(data.subtotal),
        taxAmount: parseFloat(data.tax_amount),
        shippingAmount: parseFloat(data.shipping_amount),
        discountAmount: data.discount_amount ? parseFloat(data.discount_amount) : undefined,
        paymentMethod: data.payment_method,
        paymentId: data.payment_id,
        shippingAddress: data.shipping_address,
        billingAddress: data.billing_address,
        trackingNumber: data.tracking_number,
        shippedAt: data.shipped_at ? new Date(data.shipped_at) : undefined,
        deliveredAt: data.delivered_at ? new Date(data.delivered_at) : undefined,
        notes: data.notes,
        currency: data.currency,
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
        items: data.order_items || [],
        trackingHistory: data.tracking_history || []
      };
    } catch (error) {
      return this.handleError(error, 'Update Order Status');
    }
  }
}