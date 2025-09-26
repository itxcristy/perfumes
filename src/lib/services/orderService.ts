import { DataService, supabase } from '../dataService';
import { Order } from '../../types';

export class OrderService extends DataService {
  // Create order for authenticated user
  async createOrder(orderData: {
    items: any[];
    shippingAddress: any;
    billingAddress?: any;
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

      const { data, error } = await supabase
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
n      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return data.id;
    } catch (error) {
      this.handleError(error, 'Create Order');
      return null;
    }
  }

  // Get order by ID
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*, products(name, image_url)),
          profiles(full_name, email)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      return data ? {
        id: data.id,
        userId: data.user_id,
        status: data.status,
        totalAmount: parseFloat(data.total_amount),
        shippingAddress: data.shipping_address,
        paymentMethod: data.payment_method,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        items: data.order_items || []
      } : null;
    } catch (error) {
      return this.handleError(error, 'Get Order By ID');
    }
  }
}