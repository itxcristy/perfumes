import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Package,
  Edit2,
  CheckCircle
} from 'lucide-react';
import { MobileFormInput, MobileSecurityIndicator } from './MobileCheckout';

interface MobileShippingFormProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
}

export const MobileShippingForm: React.FC<MobileShippingFormProps> = ({
  formData,
  onChange,
  errors = {}
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Shipping Information</h2>
        <MobileSecurityIndicator />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <MobileFormInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="John"
            required
            error={errors.firstName || ''}
            icon={User}
          />
          <MobileFormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Doe"
            required
            error={errors.lastName || ''}
          />
        </div>

        <MobileFormInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          placeholder="john@example.com"
          required
          error={errors.email || ''}
          icon={Mail}
        />

        <MobileFormInput
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="+1 (555) 123-4567"
          required
          error={errors.phone || ''}
          icon={Phone}
        />

        <MobileFormInput
          label="Street Address"
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="123 Main Street"
          required
          error={errors.address || ''}
          icon={MapPin}
        />

        <div className="grid grid-cols-2 gap-3">
          <MobileFormInput
            label="City"
            name="city"
            value={formData.city}
            onChange={onChange}
            placeholder="New York"
            required
            error={errors.city || ''}
          />
          <MobileFormInput
            label="State"
            name="state"
            value={formData.state}
            onChange={onChange}
            placeholder="NY"
            required
            error={errors.state || ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MobileFormInput
            label="ZIP Code"
            name="zipCode"
            value={formData.zipCode}
            onChange={onChange}
            placeholder="10001"
            required
            error={errors.zipCode || ''}
          />
          <div className="space-y-2">
            <label htmlFor="mobile-country-select" className="block text-sm font-medium text-neutral-900">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              id="mobile-country-select"
              name="country"
              value={formData.country}
              onChange={(e) => onChange(e as any)}
              className="w-full px-4 py-4 text-base border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors duration-200 touch-manipulation"
              required
            >
              <option value="Srinagar">Srinagar</option>
              <option value="Budgam">Budgam</option>
              <option value="Baramullah">Baramullah</option>
              <option value="Sopore">Sopore</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Information Toggle */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="saveInfo"
            checked={formData.saveInfo}
            onChange={onChange}
            className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <span className="text-sm text-neutral-700">
            Save this information for faster checkout next time
          </span>
        </label>
      </div>
    </div>
  );
};

interface MobilePaymentFormProps {
  formData: any;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors?: Record<string, string>;
  selectedPaymentMethod: string;
}

export const MobilePaymentForm: React.FC<MobilePaymentFormProps> = ({
  formData,
  onChange,
  errors = {},
  selectedPaymentMethod
}) => {
  const [showCVV, setShowCVV] = useState(false);

  if (selectedPaymentMethod !== 'card') {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {selectedPaymentMethod === 'apple-pay' ? 'Apple Pay' : 'Google Pay'} Selected
          </h3>
          <p className="text-neutral-600">
            You'll be redirected to complete your payment securely
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Payment Information</h2>
        <MobileSecurityIndicator />
      </div>

      <div className="space-y-4">
        <MobileFormInput
          label="Card Number"
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={onChange}
          placeholder="1234 5678 9012 3456"
          required
          error={errors.cardNumber || ''}
          icon={CreditCard}
        />

        <div className="grid grid-cols-2 gap-3">
          <MobileFormInput
            label="Expiry Date"
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={onChange}
            placeholder="MM/YY"
            required
            error={errors.expiryDate || ''}
            icon={Calendar}
          />

          <div className="space-y-2">
            <label htmlFor="mobile-cvv-input" className="block text-sm font-medium text-neutral-900">
              CVV <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                id="mobile-cvv-input"
                type={showCVV ? 'text' : 'password'}
                name="cvv"
                value={formData.cvv}
                onChange={onChange}
                placeholder="123"
                required
                className={`
                  w-full px-4 py-4 pl-10 pr-12 text-base border border-neutral-300 rounded-xl
                  focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500
                  transition-colors duration-200 touch-manipulation
                  ${errors.cvv ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                `}
              />
              <button
                type="button"
                onClick={() => setShowCVV(!showCVV)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label={showCVV ? "Hide CVV" : "Show CVV"}
              >
                {showCVV ? (
                  <EyeOff className="h-5 w-5 text-neutral-500" />
                ) : (
                  <Eye className="h-5 w-5 text-neutral-500" />
                )}
              </button>
            </div>
            {errors.cvv && (
              <p className="text-sm text-red-600" role="alert">{errors.cvv}</p>
            )}
          </div>
        </div>

        <MobileFormInput
          label="Name on Card"
          name="cardName"
          value={formData.cardName}
          onChange={onChange}
          placeholder="John Doe"
          required
          error={errors.cardName || ''}
          icon={User}
        />
      </div>

      {/* Billing Address Toggle */}
      <div className="bg-neutral-50 rounded-xl p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="sameAsBilling"
            checked={formData.sameAsBilling}
            onChange={onChange}
            className="w-5 h-5 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <span className="text-sm text-neutral-700">
            Billing address is the same as shipping address
          </span>
        </label>
      </div>
    </div>
  );
};

interface MobileOrderSummaryProps {
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  formData?: any;
  selectedPaymentMethod?: string;
  onEditShipping?: () => void;
  onEditPayment?: () => void;
}

export const MobileOrderSummary: React.FC<MobileOrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  total,
  formData,
  selectedPaymentMethod,
  onEditShipping,
  onEditPayment
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-4">
      {/* Shipping Address Section */}
      {formData && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-neutral-900">Shipping Address</h3>
            </div>
            {onEditShipping && (
              <button
                onClick={onEditShipping}
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="text-sm text-neutral-700 space-y-1">
            <p className="font-medium">{formData.firstName} {formData.lastName}</p>
            <p>{formData.address}</p>
            <p>{formData.city}, {formData.state} {formData.zipCode}</p>
            <p>{formData.country}</p>
            <p className="flex items-center space-x-1 mt-2">
              <Phone className="h-3.5 w-3.5" />
              <span>{formData.phone}</span>
            </p>
            <p className="flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5" />
              <span>{formData.email}</span>
            </p>
          </div>
        </div>
      )}

      {/* Payment Method Section */}
      {selectedPaymentMethod && (
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-neutral-900">Payment Method</h3>
            </div>
            {onEditPayment && (
              <button
                onClick={onEditPayment}
                className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-neutral-700 capitalize">
              {selectedPaymentMethod === 'cod' ? 'Cash on Delivery' :
                selectedPaymentMethod === 'razorpay' ? 'Razorpay' :
                  selectedPaymentMethod === 'apple-pay' ? 'Apple Pay' :
                    selectedPaymentMethod === 'google-pay' ? 'Google Pay' :
                      selectedPaymentMethod}
            </span>
          </div>
        </div>
      )}

      {/* Order Summary Section */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        {/* Summary Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left"
        >
          <div>
            <h3 className="font-semibold text-neutral-900">Order Summary</h3>
            <p className="text-sm text-neutral-600">{items.length} items</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-neutral-900">₹{total.toLocaleString('en-IN')}</div>
            <div className="text-sm text-neutral-600">
              {isExpanded ? 'Hide details' : 'Show details'}
            </div>
          </div>
        </button>

        {/* Expanded Details */}
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          className="overflow-hidden"
        >
          <div className="border-t border-neutral-200 p-4 space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id || item.product?.id} className="flex items-center space-x-3">
                  {item.product?.images && item.product.images.length > 0 ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 text-sm">{item.product?.name || 'Product'}</h4>
                    <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-neutral-900">
                    ₹{item.product?.price ? (item.product.price * item.quantity).toLocaleString('en-IN') : '0.00'}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-neutral-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-900">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-900">
                  {shipping === 0 ? 'Free' : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Tax (GST 18%)</span>
                <span className="text-neutral-900">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t border-neutral-200 pt-2">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
