import { supabase } from './supabase';

// Base query builder class for common functionality
export class QueryBuilder<T> {
  protected table: string;
  protected selectFields: string[] = [];
  protected filters: Array<{
    field: string;
    value: any;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike';
  }> = [];
  protected orders: Array<{
    field: string;
    ascending: boolean;
  }> = [];
  protected limitValue?: number;
  protected offsetValue?: number;

  constructor(table: string) {
    this.table = table;
  }

  // Select specific fields to reduce payload size
  select(...fields: string[]): this {
    this.selectFields = [...this.selectFields, ...fields];
    return this;
  }

  // Add equality filter
  eq(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'eq' });
    return this;
  }

  // Add inequality filter
  neq(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'neq' });
    return this;
  }

  // Add greater than filter
  gt(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'gt' });
    return this;
  }

  // Add greater than or equal filter
  gte(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'gte' });
    return this;
  }

  // Add less than filter
  lt(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'lt' });
    return this;
  }

  // Add less than or equal filter
  lte(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'lte' });
    return this;
  }

  // Add case-sensitive like filter
  like(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'like' });
    return this;
  }

  // Add case-insensitive like filter
  ilike(field: string, value: any): this {
    this.filters.push({ field, value, operator: 'ilike' });
    return this;
  }

  // Order results
  order(field: string, ascending = true): this {
    this.orders.push({ field, ascending });
    return this;
  }

  // Limit number of results
  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  // Offset for pagination
  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  // Build and execute the query
  async execute(): Promise<{ data: T[]; count: number | null }> {
    let query = supabase.from(this.table).select(this.buildSelect(), { count: 'exact' });

    // Apply filters
    this.filters.forEach(filter => {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.field, filter.value);
          break;
        case 'neq':
          query = query.neq(filter.field, filter.value);
          break;
        case 'gt':
          query = query.gt(filter.field, filter.value);
          break;
        case 'gte':
          query = query.gte(filter.field, filter.value);
          break;
        case 'lt':
          query = query.lt(filter.field, filter.value);
          break;
        case 'lte':
          query = query.lte(filter.field, filter.value);
          break;
        case 'like':
          query = query.like(filter.field, filter.value);
          break;
        case 'ilike':
          query = query.ilike(filter.field, filter.value);
          break;
      }
    });

    // Apply ordering
    this.orders.forEach(order => {
      query = query.order(order.field, { ascending: order.ascending });
    });

    // Apply limit and offset
    if (this.limitValue !== undefined) {
      if (this.offsetValue !== undefined) {
        query = query.range(this.offsetValue, this.offsetValue + this.limitValue - 1);
      } else {
        query = query.limit(this.limitValue);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data: data as T[], count };
  }

  // Build select string from fields
  private buildSelect(): string {
    if (this.selectFields.length === 0) {
      return '*';
    }
    return this.selectFields.join(',');
  }
}

// Product-specific query builder
export class ProductQueryBuilder extends QueryBuilder<any> {
  constructor() {
    super('products');
    // Default fields for product queries
    this.select(
      'id',
      'name',
      'slug',
      'description',
      'price',
      'original_price',
      'category_id',
      'categories!inner(name, slug)',
      'image_url',
      'images',
      'stock',
      'rating',
      'review_count',
      'tags',
      'featured',
      'active',
      'created_at'
    );
  }

  // Filter by category ID
  byCategory(categoryId: string): this {
    this.eq('category_id', categoryId);
    return this;
  }

  // Filter by category slug
  byCategorySlug(slug: string): this {
    this.eq('categories.slug', slug);
    return this;
  }

  // Filter by seller
  bySeller(sellerId: string): this {
    this.eq('seller_id', sellerId);
    return this;
  }

  // Filter by featured status
  featured(onlyFeatured = true): this {
    this.eq('featured', onlyFeatured);
    return this;
  }

  // Search by name
  search(searchTerm: string): this {
    this.ilike('name', `%${searchTerm}%`);
    return this;
  }
}

// Category-specific query builder
export class CategoryQueryBuilder extends QueryBuilder<any> {
  constructor() {
    super('categories');
    // Default fields for category queries
    this.select(
      'id',
      'name',
      'slug',
      'description',
      'image_url',
      'active',
      'sort_order',
      'created_at',
      'updated_at'
    );
  }

  // Only active categories
  active(): this {
    this.eq('active', true);
    return this;
  }
}