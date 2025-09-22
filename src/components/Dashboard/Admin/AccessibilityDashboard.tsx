import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Eye, Zap, ZapOff, Type, Palette, MousePointer, Keyboard, Shield, AlertTriangle, CheckCircle, Settings, BarChart3, Accessibility, Monitor, Smartphone, Tablet } from 'lucide-react';
import { 
  useAccessibilityPreferences,
  useScreenReaderAnnouncements,
  accessibilityTest,
  colorContrast
} from '../../../utils/accessibilityUtils';
import { useResponsiveDesign } from '../../../utils/responsiveDesign';

interface AccessibilityDashboardProps {
  className?: string;
}

interface AccessibilityMetrics {
  score: number;
  issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    description: string;
  }>;
  compliance: {
    wcagA: boolean;
    wcagAA: boolean;
    wcagAAA: boolean;
  };
}

export const AccessibilityDashboard: React.FC<AccessibilityDashboardProps> = ({ 
  className = '' 
}) => {
  const { preferences, updatePreference } = useAccessibilityPreferences();
  const { announce } = useScreenReaderAnnouncements();
  const { deviceType, breakpoint, isTouch } = useResponsiveDesign();
  
  const [metrics, setMetrics] = useState<AccessibilityMetrics | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'preferences' | 'metrics' | 'testing'>('preferences');

  // Run accessibility scan
  const runAccessibilityScan = async () => {
    setIsScanning(true);
    announce('Starting accessibility scan', 'polite');

    try {
      // Simulate scan delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const report = accessibilityTest.generateReport();
      
      // Calculate metrics
      const issues = [
        {
          type: 'Missing Alt Text',
          severity: 'high' as const,
          count: report.missingAltText.length,
          description: 'Images without alternative text'
        },
        {
          type: 'Missing Form Labels',
          severity: 'critical' as const,
          count: report.missingFormLabels.length,
          description: 'Form inputs without proper labels'
        },
        {
          type: 'Heading Issues',
          severity: 'medium' as const,
          count: report.headingIssues.length,
          description: 'Improper heading hierarchy'
        }
      ];

      const totalIssues = issues.reduce((sum, issue) => sum + issue.count, 0);
      const score = Math.max(0, 100 - (totalIssues * 5));

      const newMetrics: AccessibilityMetrics = {
        score,
        issues,
        compliance: {
          wcagA: score >= 80,
          wcagAA: score >= 90,
          wcagAAA: score >= 95
        }
      };

      setMetrics(newMetrics);
      announce(`Accessibility scan complete. Score: ${score}%`, 'assertive');
    } catch (error) {
      console.error('Accessibility scan failed:', error);
      announce('Accessibility scan failed', 'assertive');
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-run scan on component mount
  useEffect(() => {
    runAccessibilityScan();
  }, []);

  // Preference controls
  const preferenceControls = useMemo(() => [
    {
      key: 'reducedMotion' as const,
      label: 'Reduce Motion',
      description: 'Minimize animations and transitions',
      icon: preferences.reducedMotion ? ZapOff : Zap,
      enabled: preferences.reducedMotion
    },
    {
      key: 'highContrast' as const,
      label: 'High Contrast',
      description: 'Increase color contrast for better visibility',
      icon: Palette,
      enabled: preferences.highContrast
    },
    {
      key: 'largeText' as const,
      label: 'Large Text',
      description: 'Increase text size for better readability',
      icon: Type,
      enabled: preferences.largeText
    },
    {
      key: 'keyboardNavigation' as const,
      label: 'Keyboard Navigation',
      description: 'Enhanced keyboard navigation support',
      icon: Keyboard,
      enabled: preferences.keyboardNavigation
    },
    {
      key: 'focusVisible' as const,
      label: 'Focus Indicators',
      description: 'Show visible focus indicators',
      icon: MousePointer,
      enabled: preferences.focusVisible
    }
  ], [preferences]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Accessibility className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Accessibility Dashboard</h2>
            <p className="text-gray-600">Monitor and manage accessibility features</p>
          </div>
        </div>

        <button
          onClick={runAccessibilityScan}
          disabled={isScanning}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Shield className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Run Scan'}</span>
        </button>
      </div>

      {/* Device Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            {deviceType === 'mobile' && <Smartphone className="w-5 h-5 text-blue-600" />}
            {deviceType === 'tablet' && <Tablet className="w-5 h-5 text-blue-600" />}
            {deviceType === 'desktop' && <Monitor className="w-5 h-5 text-blue-600" />}
            <div>
              <p className="font-medium text-gray-900">Device Type</p>
              <p className="text-sm text-gray-600 capitalize">{deviceType}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <MousePointer className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Input Method</p>
              <p className="text-sm text-gray-600">{isTouch ? 'Touch' : 'Mouse/Keyboard'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">Breakpoint</p>
              <p className="text-sm text-gray-600 uppercase">{breakpoint}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'preferences', label: 'Preferences', icon: Settings },
            { id: 'metrics', label: 'Metrics', icon: BarChart3 },
            { id: 'testing', label: 'Testing', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {selectedTab === 'preferences' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900">Accessibility Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {preferenceControls.map(({ key, label, description, icon: Icon, enabled }) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${enabled ? 'bg-purple-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${enabled ? 'text-purple-600' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        updatePreference(key, !enabled);
                        announce(`${label} ${!enabled ? 'enabled' : 'disabled'}`, 'polite');
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        enabled ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                      role="switch"
                      aria-checked={enabled}
                      aria-label={`Toggle ${label}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTab === 'metrics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {metrics ? (
              <>
                {/* Score Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Accessibility Score</h3>
                    <div className={`text-3xl font-bold ${getScoreColor(metrics.score)}`}>
                      {metrics.score}%
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        metrics.score >= 90 ? 'bg-green-500' :
                        metrics.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metrics.score}%` }}
                    />
                  </div>

                  {/* WCAG Compliance */}
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(metrics.compliance).map(([level, compliant]) => (
                      <div key={level} className="text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                          compliant ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {compliant ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{level.toUpperCase()}</p>
                        <p className="text-xs text-gray-600">{compliant ? 'Compliant' : 'Non-compliant'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Breakdown</h3>
                  
                  <div className="space-y-3">
                    {metrics.issues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                            {issue.severity.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{issue.type}</p>
                            <p className="text-sm text-gray-600">{issue.description}</p>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {issue.count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Run an accessibility scan to see metrics</p>
              </div>
            )}
          </motion.div>
        )}

        {selectedTab === 'testing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Testing Tools</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const issues = accessibilityTest.checkAltText();
                    announce(`Found ${issues.length} images without alt text`, 'assertive');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <Eye className="w-5 h-5 text-blue-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Check Alt Text</h4>
                  <p className="text-sm text-gray-600">Find images missing alternative text</p>
                </button>

                <button
                  onClick={() => {
                    const issues = accessibilityTest.checkFormLabels();
                    announce(`Found ${issues.length} form inputs without labels`, 'assertive');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <Type className="w-5 h-5 text-green-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Check Form Labels</h4>
                  <p className="text-sm text-gray-600">Find form inputs without proper labels</p>
                </button>

                <button
                  onClick={() => {
                    const issues = accessibilityTest.checkHeadingHierarchy();
                    announce(`Found ${issues.length} heading hierarchy issues`, 'assertive');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Check Headings</h4>
                  <p className="text-sm text-gray-600">Verify proper heading hierarchy</p>
                </button>

                <button
                  onClick={runAccessibilityScan}
                  disabled={isScanning}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors disabled:opacity-50"
                >
                  <Shield className={`w-5 h-5 text-orange-600 mb-2 ${isScanning ? 'animate-spin' : ''}`} />
                  <h4 className="font-medium text-gray-900">Full Scan</h4>
                  <p className="text-sm text-gray-600">Run comprehensive accessibility audit</p>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
