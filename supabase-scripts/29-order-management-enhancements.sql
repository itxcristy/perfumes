-- ==========================================
-- Order Management System Enhancements
-- ==========================================

-- Create order audit log table
CREATE TABLE IF NOT EXISTS public.order_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'status_changed', 'cancelled', 'refunded', etc.
    details JSONB DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory log table
CREATE TABLE IF NOT EXISTS public.inventory_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL, -- positive for increase, negative for decrease
    new_stock INTEGER NOT NULL,
    reason TEXT NOT NULL, -- 'order_placed', 'order_cancelled', 'stock_adjustment', 'return_processed'
    reference_id UUID, -- order_id or other reference
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add tracking and delivery fields to orders table if they don't exist
DO $$ 
BEGIN
    -- Add tracking_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'tracking_number') THEN
        ALTER TABLE public.orders ADD COLUMN tracking_number TEXT;
    END IF;

    -- Add estimated_delivery column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'estimated_delivery') THEN
        ALTER TABLE public.orders ADD COLUMN estimated_delivery TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'notes') THEN
        ALTER TABLE public.orders ADD COLUMN notes TEXT;
    END IF;

    -- Add shipped_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'shipped_at') THEN
        ALTER TABLE public.orders ADD COLUMN shipped_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add delivered_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'delivered_at') THEN
        ALTER TABLE public.orders ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add min_stock_level to products if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'min_stock_level') THEN
        ALTER TABLE public.products ADD COLUMN min_stock_level INTEGER DEFAULT 5;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_audit_log_order_id ON public.order_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_log_created_at ON public.order_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_log_product_id ON public.inventory_log(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_created_at ON public.inventory_log(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- ==========================================
-- Row Level Security Policies
-- ==========================================

-- Enable RLS on new tables
ALTER TABLE public.order_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_log ENABLE ROW LEVEL SECURITY;

-- Order audit log policies
CREATE POLICY "Admin can view all order audit logs" ON public.order_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can insert order audit logs" ON public.order_audit_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'seller')
        )
    );

-- Inventory log policies
CREATE POLICY "Admin can view all inventory logs" ON public.inventory_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admin can insert inventory logs" ON public.inventory_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'seller')
        )
    );

-- ==========================================
-- Order Management Functions
-- ==========================================

-- Function to update order status with audit logging
CREATE OR REPLACE FUNCTION public.update_order_status(
    p_order_id UUID,
    p_new_status TEXT,
    p_tracking_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_old_status TEXT;
    v_result JSONB;
BEGIN
    -- Check if user has permission
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'seller')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;

    -- Get current status
    SELECT status INTO v_old_status FROM public.orders WHERE id = p_order_id;
    
    IF v_old_status IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Order not found');
    END IF;

    -- Update order
    UPDATE public.orders 
    SET 
        status = p_new_status,
        tracking_number = COALESCE(p_tracking_number, tracking_number),
        notes = COALESCE(p_notes, notes),
        shipped_at = CASE WHEN p_new_status = 'shipped' AND shipped_at IS NULL THEN NOW() ELSE shipped_at END,
        delivered_at = CASE WHEN p_new_status = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Log the status change
    INSERT INTO public.order_audit_log (order_id, action, details, created_by)
    VALUES (
        p_order_id,
        'status_changed',
        jsonb_build_object(
            'old_status', v_old_status,
            'new_status', p_new_status,
            'tracking_number', p_tracking_number,
            'notes', p_notes
        ),
        auth.uid()
    );

    RETURN jsonb_build_object('success', true, 'message', 'Order status updated successfully');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order analytics
CREATE OR REPLACE FUNCTION public.get_order_analytics(
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_total_orders INTEGER;
    v_total_revenue DECIMAL;
    v_status_breakdown JSONB;
    v_avg_order_value DECIMAL;
BEGIN
    -- Check if user has permission
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'seller')
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient permissions');
    END IF;

    -- Get total orders and revenue
    SELECT 
        COUNT(*),
        COALESCE(SUM(total_amount), 0),
        COALESCE(AVG(total_amount), 0)
    INTO v_total_orders, v_total_revenue, v_avg_order_value
    FROM public.orders
    WHERE (p_date_from IS NULL OR created_at::DATE >= p_date_from)
    AND (p_date_to IS NULL OR created_at::DATE <= p_date_to);

    -- Get status breakdown
    SELECT jsonb_object_agg(status, count)
    INTO v_status_breakdown
    FROM (
        SELECT status, COUNT(*) as count
        FROM public.orders
        WHERE (p_date_from IS NULL OR created_at::DATE >= p_date_from)
        AND (p_date_to IS NULL OR created_at::DATE <= p_date_to)
        GROUP BY status
    ) status_counts;

    v_result := jsonb_build_object(
        'success', true,
        'analytics', jsonb_build_object(
            'total_orders', v_total_orders,
            'total_revenue', v_total_revenue,
            'average_order_value', v_avg_order_value,
            'status_breakdown', COALESCE(v_status_breakdown, '{}'::jsonb)
        )
    );

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get low stock products
CREATE OR REPLACE FUNCTION public.get_low_stock_products()
RETURNS TABLE (
    id UUID,
    name TEXT,
    sku TEXT,
    current_stock INTEGER,
    min_stock_level INTEGER,
    category_name TEXT
) AS $$
BEGIN
    -- Check if user has permission
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'seller')
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions';
    END IF;

    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock as current_stock,
        p.min_stock_level,
        c.name as category_name
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.stock <= p.min_stock_level
    AND p.is_active = true
    ORDER BY (p.stock::FLOAT / NULLIF(p.min_stock_level, 0)) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_low_stock_products TO authenticated;

-- ==========================================
-- Triggers for automatic inventory tracking
-- ==========================================

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION public.log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if stock actually changed
    IF (TG_OP = 'UPDATE' AND OLD.stock != NEW.stock) OR TG_OP = 'INSERT' THEN
        INSERT INTO public.inventory_log (
            product_id,
            quantity_change,
            new_stock,
            reason,
            notes
        ) VALUES (
            COALESCE(NEW.id, OLD.id),
            CASE 
                WHEN TG_OP = 'INSERT' THEN NEW.stock
                ELSE NEW.stock - OLD.stock
            END,
            NEW.stock,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'initial_stock'
                ELSE 'stock_adjustment'
            END,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'Initial stock set'
                ELSE 'Stock manually adjusted'
            END
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for inventory logging
DROP TRIGGER IF EXISTS trigger_log_inventory_change ON public.products;
CREATE TRIGGER trigger_log_inventory_change
    AFTER INSERT OR UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.log_inventory_change();

-- ==========================================
-- Sample data for testing (optional)
-- ==========================================

-- Insert some sample audit log entries (uncomment if needed for testing)
-- INSERT INTO public.order_audit_log (order_id, action, details) 
-- SELECT 
--     id,
--     'status_changed',
--     jsonb_build_object('old_status', 'pending', 'new_status', status)
-- FROM public.orders 
-- LIMIT 5;

COMMIT;
