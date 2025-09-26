import { DataService, supabase } from '../dataService';
import { WishlistItem } from '../../types';

export class WishlistService extends DataService {
  // Get wishlist items for user
  async getWishlistItems(userId?: string) {
    try {
      // Get user ID if not provided
      if (!userId) {
        const user = await this.getCurrentUser();
        if (!user) {
          console.warn('No authenticated user found for wishlist items');
          return [];
        }
        userId = user.id;
      }

      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          *,
          products(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
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
      return this.handleError(error, 'Get Wishlist Items');
    }
  }

  // Add item to wishlist
  async addToWishlist(productId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          product_id: productId,
          user_id: user.id
        });

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Add To Wishlist');
      return false;
    }
  }

  // Remove item from wishlist
  async removeFromWishlist(productId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      this.handleError(error, 'Remove From Wishlist');
      return false;
    }
  }
}