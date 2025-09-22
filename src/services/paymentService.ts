/**
 * Razorpay Payment Service for Sufi Essences
 * Handles payment processing for Indian market with UPI, cards, wallets, etc.
 */

import { CartItem } from '../types';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface PaymentData {
  amount: number;
  currency: string;
  items: CartItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

class PaymentService {
  private razorpayKeyId: string;
  private isTestMode: boolean;

  constructor() {
    this.razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
    this.isTestMode = import.meta.env.VITE_APP_ENV !== 'production';
    
    if (!this.razorpayKeyId) {
      console.warn('Razorpay Key ID not configured');
    }
  }

  /**
   * Load Razorpay script dynamically
   */
  private async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Calculate GST (18% for perfumes in India)
   */
  private calculateGST(amount: number): number {
    const gstRate = parseFloat(import.meta.env.VITE_GST_RATE || '0.18');
    return Math.round(amount * gstRate * 100) / 100;
  }

  /**
   * Calculate shipping charges based on location
   */
  private calculateShipping(state: string, amount: number): number {
    const freeShippingThreshold = parseFloat(import.meta.env.VITE_FREE_SHIPPING_THRESHOLD || '2000');
    
    if (amount >= freeShippingThreshold) {
      return 0;
    }

    // Kashmir gets special rates
    if (state.toLowerCase().includes('kashmir') || state.toLowerCase().includes('jammu')) {
      return parseFloat(import.meta.env.VITE_KASHMIR_SHIPPING_RATE || '50');
    }

    // Domestic shipping
    return parseFloat(import.meta.env.VITE_DOMESTIC_SHIPPING_RATE || '100');
  }

  /**
   * Create payment order on backend
   */
  private async createPaymentOrder(paymentData: PaymentData): Promise<PaymentOrder> {
    try {
      // Calculate totals
      const subtotal = paymentData.amount;
      const gst = this.calculateGST(subtotal);
      const shipping = this.calculateShipping(paymentData.shippingAddress.state, subtotal);
      const total = subtotal + gst + shipping;

      const orderData = {
        amount: Math.round(total * 100), // Razorpay expects amount in paise
        currency: paymentData.currency,
        receipt: `order_${Date.now()}`,
        notes: {
          customer_name: paymentData.customerInfo.name,
          customer_email: paymentData.customerInfo.email,
          items_count: paymentData.items.length.toString(),
          subtotal: subtotal.toString(),
          gst: gst.toString(),
          shipping: shipping.toString(),
          total: total.toString()
        }
      };

      // Call Netlify function to create Razorpay order
      const response = await fetch('/.netlify/functions/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment order');
      }

      return result.order;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Process payment using Razorpay
   */
  async processPayment(paymentData: PaymentData): Promise<{ success: boolean; paymentId?: string; error?: string }> {
    try {
      // Load Razorpay script
      const scriptLoaded = await this.loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create payment order
      const order = await this.createPaymentOrder(paymentData);

      return new Promise((resolve) => {
        const options: RazorpayOptions = {
          key: this.razorpayKeyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Sufi Essences',
          description: 'Premium Kashmiri Perfumes & Attars',
          image: '/logo.png', // Add your logo
          order_id: order.id,
          handler: (response: RazorpayResponse) => {
            // Payment successful
            this.verifyPayment(response)
              .then(() => {
                resolve({
                  success: true,
                  paymentId: response.razorpay_payment_id
                });
              })
              .catch((error) => {
                resolve({
                  success: false,
                  error: error.message
                });
              });
          },
          prefill: {
            name: paymentData.customerInfo.name,
            email: paymentData.customerInfo.email,
            contact: paymentData.customerInfo.phone
          },
          notes: {
            address: `${paymentData.shippingAddress.street}, ${paymentData.shippingAddress.city}`,
            state: paymentData.shippingAddress.state
          },
          theme: {
            color: '#8B5A3C' // Brand color for Sufi Essences
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user'
              });
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  /**
   * Verify payment signature on backend
   */
  private async verifyPayment(response: RazorpayResponse): Promise<boolean> {
    try {
      // Validate that we have the required fields
      if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
        throw new Error('Invalid payment response');
      }

      // Call Netlify function to verify payment signature
      const verificationResponse = await fetch('/.netlify/functions/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response)
      });

      if (!verificationResponse.ok) {
        throw new Error(`HTTP error! status: ${verificationResponse.status}`);
      }

      const result = await verificationResponse.json();

      if (!result.success || !result.verified) {
        throw new Error(result.error || 'Payment verification failed');
      }

      return true;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw new Error('Payment verification failed');
    }
  }

  /**
   * Get supported payment methods
   */
  getSupportedPaymentMethods() {
    return [
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Visa, Mastercard, RuPay',
        icon: '💳'
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Google Pay, PhonePe, Paytm',
        icon: '📱'
      },
      {
        id: 'netbanking',
        name: 'Net Banking',
        description: 'All major banks',
        icon: '🏦'
      },
      {
        id: 'wallet',
        name: 'Wallets',
        description: 'Paytm, Mobikwik, etc.',
        icon: '👛'
      },
      {
        id: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay when you receive',
        icon: '💵'
      }
    ];
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Check if payment gateway is configured
   */
  isConfigured(): boolean {
    return !!this.razorpayKeyId;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
