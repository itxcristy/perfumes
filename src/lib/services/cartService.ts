import { DataService, supabase } from '../dataService';
import { CartItem } from '../../types';

export class CartService extends DataService {
  // Get cart items for user
  async getCartItems(userId?: string) {
    try {
      // Get user ID if not provided
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) {
          console.warn('No authenticated user found for cart items');
          return [];
        }
        userId = user.id;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products(name, price, image_url, slug)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        quantity: item.quantity,
        addedAt: new Date(item.created_at),
        product: {
          id: item.products?.id,
          name: item.products?.name,
          price: parseFloat(item.products?.price) || 0,
          imageUrl: item.products?.image_url,
          slug: item.products?.slug
        }
      }));
    } catch (error) {
      return this.handleError(error, 'Get Cart Items');
    }
  }

  // Add item to cart
  async addToCart(productId: string, variantId?: string, quantity: number = 1): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('add_to_cart', {
        p_product_id: productId,
        p_variant_id: variantId,
        p_quantity: quantity
      });

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Add To Cart');
      return false;
    }
  }

  // Update cart item quantity
  async updateCartItemQuantity(cartItemId: string, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', cartItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Update Cart Item Quantity');
      return false;
    }
  }

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Remove From Cart');
      return false;
    }
  }

  // Clear entire cart
  async clearCart(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Clear Cart');
      return false;
    }
  }
}