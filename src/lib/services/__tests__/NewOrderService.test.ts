import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { NewOrderService } from '../NewOrderService';
import { supabase } from '../../supabase';
import { AppError } from '../../utils/errorHandling';

// Mock Supabase client
vi.mock('../../supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn()
    }
  }
}));

// Mock error handling
vi.mock('../../utils/errorHandling', () => ({
  ErrorCode: {
    DATABASE_ERROR: 'DATABASE_ERROR'
  },
  AppError: class MockAppError extends Error {
    constructor(public code: string, message: string) {
      super(message);
      this.name = 'AppError';
    }
  }
}));

describe('NewOrderService', () => {
  let orderService: NewOrderService;
  
  beforeEach(() => {
    orderService = new NewOrderService();
    vi.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order', async () => {
      const orderData = {
        items: [
          {
            id: 'prod1',
            product_id: 'prod1',
            quantity: 2,
            price: 10.99
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890'
        },
        paymentMethod: 'credit_card'
      };
      
      const mockOrderData = {
        id: 'order1',
        order_number: 'ORD123456',
        user_id: 'user1',
        subtotal: '21.98',
        tax_amount: '3.96',
        shipping_amount: '0.00',
        total_amount: '25.94',
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'credit_card',
        shipping_address: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890'
        },
        billing_address: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890'
        },
        created_at: '2023-01-01T00:00:00Z'
      };
      
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      const mockOrderResponse = { data: mockOrderData, error: null };
      
      const mockOrderItemsInsert = vi.fn().mockReturnThis();
      const mockOrderItemsResponse = { data: null, error: null };
      
      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            insert: mockInsert
          };
        } else if (table === 'order_items') {
          return {
            insert: mockOrderItemsInsert
          };
        }
        return {};
      });
      
      mockInsert.mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue(mockOrderResponse);
      mockOrderItemsInsert.mockResolvedValue(mockOrderItemsResponse);
      
      // Mock authenticated user
      (supabase.auth.getUser as Mock).mockResolvedValue({
        data: { user: { id: 'user1' } },
        error: null
      });
      
      const result = await orderService.createOrder(orderData);
      
      expect(result).toBe('order1');
    });

    it('should handle errors gracefully', async () => {
      const orderData = {
        items: [
          {
            id: 'prod1',
            product_id: 'prod1',
            quantity: 2,
            price: 10.99
          }
        ],
        shippingAddress: {
          fullName: 'Test User',
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'India',
          phone: '1234567890'
        },
        paymentMethod: 'credit_card'
      };
      
      const mockError = new Error('Database error');
      const mockInsert = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockReturnThis();
      
      (supabase.from as Mock).mockReturnValue({
        insert: mockInsert
      });
      
      mockInsert.mockReturnValue({
        select: mockSelect
      });
      
      mockSelect.mockReturnValue({
        single: mockSingle
      });
      
      mockSingle.mockResolvedValue({ data: null, error: mockError });
      
      // Mock authenticated user
      (supabase.auth.getUser as Mock).mockResolvedValue({
        data: { user: { id: 'user1' } },
        error: null
      });
      
      await expect(orderService.createOrder(orderData)).rejects.toThrow(AppError);
    });
  });
});