import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Wallet, Banknote, Shield, CheckCircle, X, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
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
      name: 'Credit/Debit Cards',
      description: 'Visa, Mastercard, Rupay',
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
      onSuccess('cod_' + Date.now());
      return;
    }

    // For other payment methods, we'll simulate a successful payment
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess('rzp_' + Date.now());
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full mx-auto border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-white" />
          <h2 className="text-xl font-bold text-white">Secure Payment</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Payment Summary */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST (18%)</span>
            <span className="font-medium">₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">
              {shipping === 0 ? (
                <span className="text-green-600 font-semibold">FREE</span>
              ) : (
                `₹${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-lg font-bold text-indigo-600">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods - Horizontal Scroll */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
        <div className="mb-6">
          <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            <div className="flex space-x-3 min-w-max">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[100px] ${selectedMethod === method.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`p-3 rounded-full ${method.color} text-white mb-2`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900 text-sm">{method.name}</div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-4 h-4 text-indigo-500 mx-auto mt-1" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Description */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              {paymentMethods.find(m => m.id === selectedMethod)?.description}
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mb-6 flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
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
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : selectedMethod === 'cod'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } shadow-md hover:shadow-lg transition-shadow`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing Payment...</span>
              </div>
            ) : (
              <>
                <span>Pay ₹{total.toFixed(2)}</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </motion.button>

          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors font-medium rounded-lg border border-gray-200 hover:border-gray-300"
          >
            Cancel Payment
          </button>
        </div>

        {/* Payment Info */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>By proceeding, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-1">All transactions are secured and encrypted.</p>
        </div>
      </div>
    </motion.div>
  );
};