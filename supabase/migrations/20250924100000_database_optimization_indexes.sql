-- ==========================================
-- Database Optimization Indexes
-- Add missing indexes for improved performance
-- ==========================================

-- Products table - Add composite index for featured products with creation date
-- This supports queries for featured products ordered by creation date
DROP INDEX IF EXISTS idx_products_featured_created_at;
CREATE INDEX idx_products_featured_created_at ON public.products(is_featured, created_at DESC) WHERE is_active = true;

-- Products table - Add trigram index on name for fuzzy search
-- This improves performance of ilike queries on product names
DROP INDEX IF EXISTS idx_products_name_trgm;
CREATE INDEX idx_products_name_trgm ON public.products USING GIN(name gin_trgm_ops);

-- Products table - Add index on price range for filtering
-- This supports price-based filtering and range queries
DROP INDEX IF EXISTS idx_products_price_range;
CREATE INDEX idx_products_price_range ON public.products(price);

-- Products table - Add composite index for category and status
-- This supports queries that filter by category and active status
DROP INDEX IF EXISTS idx_products_category_status;
CREATE INDEX idx_products_category_status ON public.products(category_id, is_active);

-- Categories table - Add index on sort_order for custom ordering
-- This supports queries that order categories by custom sort order
DROP INDEX IF EXISTS idx_categories_sort_order;
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- Update migration version tracking
INSERT INTO schema_migrations (version) VALUES ('20250924100000');