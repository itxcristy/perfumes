import { DataService, supabase } from '../dataService';
import { Category } from '../../types';

export class CategoryService extends DataService {
  // Get all categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          active,
          sort_order,
          created_at,
          updated_at
        `)
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        imageUrl: item.image_url,
        isActive: item.active,
        sortOrder: item.sort_order,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
    } catch (error) {
      return this.handleError(error, 'Get Categories');
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      return data ? {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        imageUrl: data.image_url,
        isActive: data.active,
        sortOrder: data.sort_order,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } : null;
    } catch (error) {
      return this.handleError(error, 'Get Category By Slug');
    }
  }
}