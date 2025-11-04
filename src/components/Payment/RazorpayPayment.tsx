import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Wallet, Banknote, Shield, CheckCircle, X, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../../contexts/NotificationContext';
import { CartItem } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

    // For online payment methods, use Razorpay
    setIsProcessing(true);

    try {
      // Verify token exists
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Validate Razorpay SDK is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Payment service is not available. Please refresh the page and try again.');
      }

      // Validate API URL is configured
      if (!API_URL) {
        throw new Error('Payment service configuration error. Please contact support.');
      }

      console.log('Initiating payment:', {
        amount: total,
        currency: 'INR',
        method: selectedMethod
      });

      // Step 1: Create Razorpay order on backend
      const createOrderResponse = await fetch(`${API_URL}/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            items_count: items.length,
            payment_method: selectedMethod
          }
        })
      });

      if (!createOrderResponse.ok) {
        // Try to get error details from response
        let errorMessage = 'Failed to create payment order';
        try {
          const errorData = await createOrderResponse.json();
          errorMessage = errorData.error?.message || errorData.message || errorMessage;
          console.error('Order creation error:', {
            status: createOrderResponse.status,
            statusText: createOrderResponse.statusText,
            error: errorData
          });
        } catch (e) {
          console.error('Order creation error:', {
            status: createOrderResponse.status,
            statusText: createOrderResponse.statusText
          });
        }
        throw new Error(errorMessage);
      }

      const responseData = await createOrderResponse.json();
      const { data } = responseData;
      if (!data || !data.orderId) {
        throw new Error('Invalid response from server: missing order ID');
      }
      const { orderId } = data;

      console.log('Order created successfully:', { orderId });

      // Step 2: Initialize Razorpay checkout with secure options
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        throw new Error('Payment service is not configured. Please contact support.');
      }

      const options: any = {
        key: razorpayKeyId,
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        name: 'Aligarh Attar House',
        description: `Payment for ${items.length} item(s)`,
        order_id: orderId,
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        notes: {
          shipping_address: `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}`,
          payment_method: selectedMethod
        },
        theme: {
          color: '#4F46E5' // Indigo color
        },
        // Disable payment method selection if specific method is chosen
        method: selectedMethod !== 'card' ? selectedMethod : undefined,
        // Handler for successful payment
        handler: async function (response: any) {
          // Step 3: Verify payment on backend
          try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
              throw new Error('Authentication token not found. Please login again.');
            }

            console.log('Payment response received:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            });

            const verifyResponse = await fetch(`${API_URL}/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) {
              let errorMessage = 'Payment verification failed';
              try {
                const errorData = await verifyResponse.json();
                errorMessage = errorData.error?.message || errorData.message || errorMessage;
                console.error('Payment verification error:', {
                  status: verifyResponse.status,
                  statusText: verifyResponse.statusText,
                  error: errorData
                });
              } catch (e) {
                console.error('Payment verification error:', {
                  status: verifyResponse.status,
                  statusText: verifyResponse.statusText
                });
              }
              throw new Error(errorMessage);
            }

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.data && verifyData.data.verified) {
              // Payment successful and verified
              console.log('Payment verified successfully:', {
                paymentId: response.razorpay_payment_id,
                status: verifyData.data.status
              });
              onSuccess(response.razorpay_payment_id);
            } else {
              throw new Error(verifyData.error?.message || 'Payment verification failed');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            setIsProcessing(false);
            onError(error.message || 'Payment verification failed');
          }
        },
        // Modal options
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            showNotification({
              type: 'info',
              title: 'Payment Cancelled',
              message: 'You cancelled the payment process. Your cart is still saved.'
            });
          }
        }
      };

      console.log('Opening Razorpay checkout...');

      // Open Razorpay checkout
      const razorpayInstance = new (window as any).Razorpay(options);

      // Handle payment failure
      razorpayInstance.on('payment.failed', function (response: any) {
        console.error('Payment failed:', {
          code: response.error.code,
          description: response.error.description
        });
        setIsProcessing(false);
        onError(response.error.description || 'Payment failed. Please try again.');
      });

      razorpayInstance.open();
      setIsProcessing(false);

    } catch (error: any) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      onError(error.message || 'Failed to initiate payment');
    }
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