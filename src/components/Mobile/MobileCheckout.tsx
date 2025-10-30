import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, CheckCircle, Lock, Smartphone, Apple } from 'lucide-react';
import { MobileTouchButton } from './MobileTouchButton';
import { useMobileDetection } from '../../hooks/useMobileGestures';

interface MobileCheckoutProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onBack: () => void;
  children: React.ReactNode;
  stepTitle: string;
  canProceed: boolean;
  isLoading?: boolean;
}

export const MobileCheckoutLayout: React.FC<MobileCheckoutProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  onBack,
  children,
  stepTitle,
  canProceed,
  isLoading = false
}) => {
  const { isMobile } = useMobileDetection();

  if (!isMobile) {
    return <>{children}</>;
  }

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors active:bg-neutral-200 touch-manipulation"
            >
              <ArrowLeft className="h-5 w-5 text-neutral-600" />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900">{stepTitle}</h1>
            <div className="text-xs sm:text-sm text-neutral-500">
              {currentStep}/{totalSteps}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-1.5 sm:h-2">
            <motion.div
              className="bg-neutral-900 h-1.5 sm:h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Mobile-optimized form input component
interface MobileFormInputProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const MobileFormInput: React.FC<MobileFormInputProps> = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon: Icon
}) => {
  // Generate a unique ID for the input if name is provided
  const inputId = name ? `mobile-input-${name}` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-neutral-900"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-neutral-400" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full px-4 py-4 text-base border border-neutral-300 rounded-xl
            focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500
            transition-colors duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            touch-manipulation
          `}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}
    </div>
  );
};

// Mobile payment method selector
interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  available: boolean;
}

interface MobilePaymentSelectorProps {
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
}

export const MobilePaymentSelector: React.FC<MobilePaymentSelectorProps> = ({
  selectedMethod,
  onMethodChange
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, Amex',
      available: true
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: Smartphone,
      description: 'Google Pay, PhonePe, Paytm',
      available: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: Building,
      description: 'All major banks',
      available: true
    },
    {
      id: 'wallet',
      name: 'Wallets',
      icon: Wallet,
      description: 'Paytm, Mobikwik',
      available: true
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: Banknote,
      description: 'Pay when delivered',
      available: true
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900">Payment Method</h3>

      {/* Horizontal Scrollable Payment Methods */}
      <div className="flex overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
        <div className="flex space-x-3 min-w-max">
          {paymentMethods.map((method) => (
            <motion.button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              disabled={!method.available}
              className={`
                flex flex-col items-center p-3 rounded-xl border-2 transition-all
                ${selectedMethod === method.id
                  ? 'border-neutral-900 bg-neutral-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
                }
                ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}
                touch-manipulation min-w-[90px]
              `}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`
                p-2 rounded-full mb-2
                ${selectedMethod === method.id ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600'}
              `}>
                <method.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <div className="font-medium text-neutral-900 text-xs">{method.name}</div>
                {selectedMethod === method.id && (
                  <CheckCircle className="h-3 w-3 text-neutral-900 mx-auto mt-1" />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Payment Method Description */}
      <div className="p-3 bg-neutral-50 rounded-lg">
        <p className="text-sm text-neutral-600 text-center">
          {paymentMethods.find(m => m.id === selectedMethod)?.description}
        </p>
      </div>
    </div>
  );
};

// Mobile checkout step navigation
interface MobileStepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: (() => void) | undefined;
  onNext: (() => void) | undefined;
  nextLabel?: string;
  canProceed: boolean;
  isLoading?: boolean;
}

export const MobileStepNavigation: React.FC<MobileStepNavigationProps> = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  nextLabel = 'Continue',
  canProceed,
  isLoading = false
}) => {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-3 sm:p-4 safe-area-bottom">
      <div className="flex space-x-2 sm:space-x-3">
        {currentStep > 1 && onBack && (
          <MobileTouchButton
            onClick={onBack}
            variant="secondary"
            size="comfortable"
            className="flex-1"
          >
            Back
          </MobileTouchButton>
        )}

        {onNext && (
          <MobileTouchButton
            onClick={onNext}
            disabled={!canProceed || isLoading}
            loading={isLoading}
            variant="primary"
            size="comfortable"
            className="flex-1"
            icon={isLastStep ? CheckCircle : ArrowRight}
          >
            {isLastStep ? 'Place Order' : nextLabel}
          </MobileTouchButton>
        )}
      </div>
    </div>
  );
};

// Security indicator for mobile
export const MobileSecurityIndicator: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Lock className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="font-medium text-green-900">Secure Checkout</div>
          <div className="text-sm text-green-700">Your information is protected with 256-bit SSL encryption</div>
        </div>
      </div>
    </div>
  );
};
