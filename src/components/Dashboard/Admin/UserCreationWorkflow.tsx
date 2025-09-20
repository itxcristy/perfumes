import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Key,
  CheckCircle,
  AlertCircle,
  Copy,
  Send,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  User,
  Shield,
  Settings
} from 'lucide-react';
import { createNewUser } from '../../../lib/supabase';
import { useNotification } from '../../../contexts/NotificationContext';
import { EnhancedButton } from '../../Common/EnhancedButton';
import { Modal } from '../../Common/Modal';

interface UserCreationData {
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'customer';
  phone: string;
  dateOfBirth: string;
  isActive: boolean;
  sendEmail: boolean;
  requireEmailConfirmation: boolean;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface UserCreationWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: any) => void;
}

export const UserCreationWorkflow: React.FC<UserCreationWorkflowProps> = ({
  isOpen,
  onClose,
  onUserCreated
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<any>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState<UserCreationData>({
    email: '',
    name: '',
    role: 'customer',
    phone: '',
    dateOfBirth: '',
    isActive: true,
    sendEmail: true,
    requireEmailConfirmation: true
  });

  const steps: WorkflowStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Enter user details and contact information',
      icon: <User className="w-5 h-5" />,
      completed: formData.name && formData.email
    },
    {
      id: 'role-permissions',
      title: 'Role & Permissions',
      description: 'Set user role and account status',
      icon: <Shield className="w-5 h-5" />,
      completed: formData.role !== ''
    },
    {
      id: 'email-settings',
      title: 'Email Settings',
      description: 'Configure email notifications and confirmation',
      icon: <Mail className="w-5 h-5" />,
      completed: true
    },
    {
      id: 'review-create',
      title: 'Review & Create',
      description: 'Review information and create the user account',
      icon: <CheckCircle className="w-5 h-5" />,
      completed: false
    },
    {
      id: 'completion',
      title: 'Account Created',
      description: 'User account created successfully',
      icon: <UserPlus className="w-5 h-5" />,
      completed: !!createdUser
    }
  ];

  const resetWorkflow = () => {
    setCurrentStep(0);
    setCreatedUser(null);
    setGeneratedPassword('');
    setShowPassword(false);
    setFormData({
      email: '',
      name: '',
      role: 'customer',
      phone: '',
      dateOfBirth: '',
      isActive: true,
      sendEmail: true,
      requireEmailConfirmation: true
    });
  };

  const handleClose = () => {
    resetWorkflow();
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const result = await createNewUser({
        email: formData.email,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        isActive: formData.isActive,
        sendEmail: formData.sendEmail
      });

      if (result.success && result.user) {
        setCreatedUser(result.user);
        setGeneratedPassword(result.password || '');
        setCurrentStep(4); // Move to completion step
        onUserCreated(result.user);

        showNotification({
          type: 'success',
          title: 'User Created Successfully',
          message: `${formData.name} has been created and ${formData.sendEmail ? 'welcome email sent' : 'is ready to use'}.`
        });
      } else {
        showNotification({
          type: 'error',
          title: 'Creation Failed',
          message: result.error || 'Failed to create user account.'
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'An unexpected error occurred while creating the user.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification({
      type: 'success',
      title: 'Copied',
      message: 'Copied to clipboard successfully.'
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 1: // Role & Permissions
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Role *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Role Permissions:</h4>
              <div className="text-sm text-gray-600">
                {formData.role === 'admin' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full access to all platform features</li>
                    <li>User management and role assignment</li>
                    <li>System settings and configuration</li>
                    <li>Analytics and reporting access</li>
                  </ul>
                )}
                {formData.role === 'seller' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Product catalog management</li>
                    <li>Order processing and fulfillment</li>
                    <li>Customer communication tools</li>
                    <li>Sales analytics and reports</li>
                  </ul>
                )}
                {formData.role === 'customer' && (
                  <ul className="list-disc list-inside space-y-1">
                    <li>Browse and purchase products</li>
                    <li>Order history and tracking</li>
                    <li>Account and profile management</li>
                    <li>Wishlist and favorites</li>
                  </ul>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Account is active and ready to use
              </label>
            </div>
          </div>
        );

      case 2: // Email Settings
        return (
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendEmail"
                checked={formData.sendEmail}
                onChange={(e) => setFormData({ ...formData, sendEmail: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                Send welcome email with login credentials
              </label>
            </div>

            {formData.sendEmail && (
              <>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireConfirmation"
                    checked={formData.requireEmailConfirmation}
                    onChange={(e) => setFormData({ ...formData, requireEmailConfirmation: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="requireConfirmation" className="ml-2 text-sm text-gray-700">
                    Require email confirmation before account activation
                  </label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Email will include:</h4>
                  <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                    <li>Welcome message and account overview</li>
                    <li>Temporary password for first login</li>
                    <li>Role-specific getting started guide</li>
                    {formData.requireEmailConfirmation && <li>Email confirmation link</li>}
                    <li>Support contact information</li>
                  </ul>
                </div>
              </>
            )}

            {!formData.sendEmail && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Manual Setup Required</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      You'll need to manually provide the user with their login credentials and account information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Review & Create
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Review User Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{formData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <span className="ml-2 text-gray-900">{formData.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="ml-2 text-gray-900 capitalize">{formData.role}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className="ml-2 text-gray-900">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                {formData.phone && (
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <span className="ml-2 text-gray-900">{formData.phone}</span>
                  </div>
                )}
                {formData.dateOfBirth && (
                  <div>
                    <span className="font-medium text-gray-700">Date of Birth:</span>
                    <span className="ml-2 text-gray-900">{new Date(formData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Email Configuration</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {formData.sendEmail ? 'Welcome email will be sent' : 'No email will be sent'}
                </div>
                {formData.sendEmail && formData.requireEmailConfirmation && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Email confirmation required
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-900">Ready to Create Account</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    A secure password will be generated automatically. Make sure all information is correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Completion
        return (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                User Account Created Successfully!
              </h3>
              <p className="text-gray-600">
                {formData.name} has been added to the system with {formData.role} privileges.
              </p>
            </div>

            {generatedPassword && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-green-900 mb-3">Generated Credentials</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      Email Address:
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm">
                        {formData.email}
                      </code>
                      <button
                        onClick={() => copyToClipboard(formData.email)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Copy email"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">
                      Temporary Password:
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono">
                        {showPassword ? generatedPassword : '••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(generatedPassword)}
                        className="p-2 text-green-600 hover:text-green-800"
                        title="Copy password"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white border border-green-300 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Important:</strong> Make sure to securely share these credentials with the user.
                    They should change the password after their first login.
                  </p>
                </div>
              </div>
            )}

            {formData.sendEmail && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Send className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Welcome Email Sent</span>
                </div>
                <p className="text-sm text-blue-800">
                  A welcome email with login instructions has been sent to {formData.email}.
                  {formData.requireEmailConfirmation && ' The user will need to confirm their email address before logging in.'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New User Account"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${index <= currentStep
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : step.completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                {step.completed && index !== currentStep ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.icon
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Info */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            {steps[currentStep]?.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {steps[currentStep]?.description}
          </p>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
          <EnhancedButton
            onClick={currentStep === 4 ? handleClose : handlePrevious}
            variant="outline"
            disabled={currentStep === 0 && !createdUser}
          >
            {currentStep === 4 ? 'Close' : (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </>
            )}
          </EnhancedButton>

          {currentStep < 3 && (
            <EnhancedButton
              onClick={handleNext}
              variant="primary"
              disabled={!steps[currentStep]?.completed}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </EnhancedButton>
          )}

          {currentStep === 3 && (
            <EnhancedButton
              onClick={handleCreateUser}
              variant="primary"
              loading={loading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create User Account
            </EnhancedButton>
          )}

          {currentStep === 4 && (
            <EnhancedButton
              onClick={() => {
                resetWorkflow();
                // Keep modal open for creating another user
              }}
              variant="primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Another User
            </EnhancedButton>
          )}
        </div>
      </div>
    </Modal>
  );
};
