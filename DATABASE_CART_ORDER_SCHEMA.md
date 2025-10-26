# 🗄️ Database Schema - Cart & Order System

## 📋 Overview

This document describes the complete database schema for the cart, checkout, and order management system in the Sufi Essences e-commerce platform.

---

## 🛒 Cart System Tables

### **1. cart_items**

Stores shopping cart items for authenticated users.

```sql
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);
```

**Key Features:**
- ✅ Unique constraint prevents duplicate items (same product + variant)
- ✅ Cascading delete when user or product is deleted
- ✅ Quantity validation (must be > 0)
- ✅ Supports product variants (size, color, etc.)

**Indexes:**
```sql
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
```

**Guest Cart:**
- Guest users (not logged in) store cart in **localStorage** as JSON
- When guest logs in, cart is merged with database cart via API

---

## 📦 Order System Tables

### **2. orders**

Main orders table storing order header information.

```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_email TEXT,
  guest_name TEXT,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  shipping_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  payment_id TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ Supports both authenticated users and guest checkout
- ✅ Stores addresses as JSONB for flexibility
- ✅ Tracks order lifecycle with status field
- ✅ Separate payment status tracking
- ✅ Automatic order number generation (ORD-{timestamp}-{random})

**Order Statuses:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed, being prepared
- `processing` - Order is being processed
- `shipped` - Order has been shipped
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled
- `refunded` - Order refunded

**Payment Statuses:**
- `pending` - Payment not yet processed
- `paid` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

**Indexes:**
```sql
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
```

---

### **3. order_items**

Stores individual items within an order.

```sql
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  product_snapshot JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ Cascading delete when order is deleted
- ✅ **Product snapshot** preserves product details at time of order
- ✅ Stores price at time of purchase (not current price)
- ✅ Supports product variants

**Product Snapshot Structure:**
```json
{
  "id": "uuid",
  "name": "Product Name",
  "description": "Product description",
  "price": 2999.00,
  "images": ["url1", "url2"],
  "sku": "SKU-123",
  "categoryId": "uuid",
  "sellerId": "uuid"
}
```

**Why Product Snapshot?**
- Products can be updated or deleted after order is placed
- Snapshot preserves exact product details at time of purchase
- Ensures order history remains accurate even if product changes

**Indexes:**
```sql
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
```

---

### **4. order_tracking** ⭐ NEW

Tracks order status changes and shipping updates.

```sql
CREATE TABLE public.order_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT,
  location TEXT,
  metadata JSONB,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ Automatic tracking entry creation when order status changes (via trigger)
- ✅ Stores location for shipment tracking
- ✅ Metadata field for additional tracking info (carrier, tracking URL, etc.)
- ✅ Tracks who created the entry (admin, system, etc.)

**Automatic Tracking Trigger:**
```sql
CREATE TRIGGER trigger_order_status_tracking
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_tracking_on_status_change();
```

**Example Tracking History:**
```json
[
  {
    "status": "pending",
    "message": "Order placed and awaiting confirmation",
    "created_at": "2025-10-25T10:00:00Z"
  },
  {
    "status": "confirmed",
    "message": "Order confirmed and being prepared",
    "created_at": "2025-10-25T11:00:00Z"
  },
  {
    "status": "shipped",
    "message": "Order has been shipped",
    "location": "Mumbai Distribution Center",
    "created_at": "2025-10-25T14:00:00Z"
  }
]
```

**Indexes:**
```sql
CREATE INDEX idx_order_tracking_order_id ON public.order_tracking(order_id);
CREATE INDEX idx_order_tracking_created_at ON public.order_tracking(created_at);
CREATE INDEX idx_order_tracking_status ON public.order_tracking(status);
```

---

## 📍 Address System

### **5. addresses**

Stores user shipping and billing addresses.

```sql
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('shipping', 'billing')) DEFAULT 'shipping',
  full_name TEXT NOT NULL,
  phone TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ Supports both shipping and billing addresses
- ✅ Default address selection
- ✅ Multiple addresses per user

**Indexes:**
```sql
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
```

---

## 💳 Payment System

### **6. payment_methods**

Stores saved payment methods for users.

```sql
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('visa', 'mastercard', 'amex', 'paypal', 'bank_transfer')) NOT NULL,
  last_four TEXT,
  expiry_month TEXT,
  expiry_year TEXT,
  cardholder_name TEXT,
  billing_address JSONB,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- ✅ Stores only last 4 digits (PCI compliance)
- ✅ Default payment method selection
- ✅ Can be deactivated without deletion

**Indexes:**
```sql
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);
```

---

## 🔄 Data Flow

### **Cart to Order Flow:**

1. **Add to Cart**
   ```
   User adds product → cart_items table (or localStorage for guests)
   ```

2. **Checkout**
   ```
   User proceeds to checkout → Displays cart items + shipping form
   ```

3. **Place Order**
   ```
   a. Create order in orders table
   b. For each cart item:
      - Fetch product details
      - Create product_snapshot
      - Insert into order_items
      - Decrease product stock
   c. Create initial order_tracking entry (via trigger)
   d. Clear cart_items for user
   ```

4. **Order Updates**
   ```
   Admin updates order status → Trigger creates order_tracking entry
   ```

---

## 📊 API Response Formats

### **Cart Response:**
```json
{
  "items": [
    {
      "id": "cart-item-uuid",
      "quantity": 2,
      "variantId": "variant-uuid",
      "product": {
        "id": "product-uuid",
        "name": "Royal Oud Attar",
        "price": 2999,
        "images": ["url"],
        "stock": 50
      }
    }
  ],
  "subtotal": 5998,
  "itemCount": 2
}
```

### **Order Response:**
```json
{
  "id": "order-uuid",
  "orderNumber": "ORD-1729857600-ABC123",
  "total": 7077.64,
  "subtotal": 5998,
  "taxAmount": 1079.64,
  "shippingAmount": 0,
  "status": "shipped",
  "paymentStatus": "paid",
  "items": [...],
  "trackingHistory": [
    {
      "status": "shipped",
      "message": "Order has been shipped",
      "location": "Mumbai",
      "createdAt": "2025-10-25T14:00:00Z"
    }
  ]
}
```

---

## 🔧 Maintenance

### **Backfill Tracking Data:**
```sql
-- Create tracking entries for existing orders
INSERT INTO public.order_tracking (order_id, status, message, created_at)
SELECT id, status, 'Order status: ' || status, created_at
FROM public.orders
WHERE NOT EXISTS (
  SELECT 1 FROM public.order_tracking WHERE order_id = orders.id
);
```

### **Clean Old Cart Items:**
```sql
-- Delete cart items older than 30 days
DELETE FROM public.cart_items
WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## ✅ Migration Applied

**File:** `server/db/migrations/add_missing_cart_order_fields.sql`

**Changes:**
1. ✅ Added `product_snapshot` column to `order_items`
2. ✅ Created `order_tracking` table
3. ✅ Added indexes for performance
4. ✅ Created automatic tracking trigger
5. ✅ Backfilled tracking data for existing orders

**Status:** ✅ Successfully applied to database

---

## 🎯 Summary

The database now fully supports:
- ✅ Shopping cart for authenticated users
- ✅ Guest cart via localStorage
- ✅ Complete order lifecycle management
- ✅ Order status tracking with history
- ✅ Product snapshots for historical accuracy
- ✅ Multiple addresses per user
- ✅ Saved payment methods
- ✅ Automatic tracking entry creation
- ✅ All fields properly indexed for performance

**All cart, checkout, and order functionality is now fully backed by the database!** 🚀

