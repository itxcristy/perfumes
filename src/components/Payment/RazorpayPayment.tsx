import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Wallet, Banknote, Shield, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
import { paymentService } from '../../services/paymentService';
import { CartItem } from '../../types';

interface RazorpayPaymentProps {
  amount: number;
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
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  items,
  customerInfo,
  shippingAddress,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('card');
  const { showNotification } = useNotification();

  // Calculate totals
  const subtotal = amount;
  const gst = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const shipping = subtotal >= 2000 ? 0 : (shippingAddress.state.toLowerCase().includes('kashmir') ? 50 : 100);
  const total = subtotal + gst + shipping;

  const paymentMethods = [
    {
      id: 'card',
      name: 'Cards',
      description: 'Credit/Debit Cards',
      icon: CreditCard,
      color: 'bg-blue-500'
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: Smartphone,
      color: 'bg-green-500'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'All major banks',
      icon: Building,
      color: 'bg-purple-500'
    },
    {
      id: 'wallet',
      name: 'Wallets',
      description: 'Paytm, Mobikwik',
      icon: Wallet,
      color: 'bg-orange-500'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when delivered',
      icon: Banknote,
      color: 'bg-gray-500'
    }
  ];

  const handlePayment = async () => {
    if (selectedMethod === 'cod') {
      // Handle Cash on Delivery
      showNotification({
        type: 'success',
        title: 'Order Placed',
        message: 'Your order has been placed. Pay when delivered.'
      });
      onSuccess('cod_' + Date.now());
      return;
    }

    if (!paymentService.isConfigured()) {
      showNotification({
        type: 'error',
        title: 'Payment Gateway Error',
        message: 'Payment gateway is not configured. Please contact support.'
      });
      onError('Payment gateway not configured');
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        amount: subtotal,
        currency: 'INR',
        items,
        customerInfo,
        shippingAddress
      };

      const result = await paymentService.processPayment(paymentData);

      if (result.success && result.paymentId) {
        showNotification({
          type: 'success',
          title: 'Payment Successful',
          message: 'Your payment has been processed successfully!'
        });
        onSuccess(result.paymentId);
      } else {
        showNotification({
          type: 'error',
          title: 'Payment Failed',
          message: result.error || 'Payment processing failed'
        });
        onError(result.error || 'Payment failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
      showNotification({
        type: 'error',
        title: 'Payment Error',
        message: errorMessage
      });
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Payment Summary */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <motion.button
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${method.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Security Badge */}
      <div className="mb-6 flex items-center justify-center space-x-2 text-sm text-gray-600">
        <Shield className="w-4 h-4 text-green-500" />
        <span>Secured by Razorpay • 256-bit SSL encryption</span>
      </div>

      {/* Payment Button */}
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing Payment...</span>
            </div>
          ) : (
            `Pay ₹${total.toFixed(2)}`
          )}
        </motion.button>

        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Payment Info */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
        <p className="mt-1">All transactions are secured and encrypted.</p>
      </div>
    </div>
  );
};
