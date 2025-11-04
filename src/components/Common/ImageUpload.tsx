import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Link, CheckCircle, Image as ImageIcon, Loader, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

import { StorageService, UploadProgress } from '../../services/storageService';
import { useNotification } from '../../contexts/NotificationContext';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (url: string | string[]) => void;
  onPathChange?: (path: string) => void;
  folder?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showUrlInput?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
  accept?: string;
  useCloudStorage?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onPathChange,
  folder = 'categories',
  placeholder = 'Upload an image or enter URL',
  className = '',
  disabled = false,
  showUrlInput = true,
  aspectRatio = 'auto',
  maxWidth = 400,
  maxHeight = 300,
  multiple = false,
  maxFiles = 5,
  label = 'Upload Images',
  helperText = 'Click to upload or drag and drop',
  accept = 'image/*',
  useCloudStorage = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const stringValue = typeof value === 'string' ? value : Array.isArray(value) ? value[0] : '';
  const [urlInput, setUrlInput] = useState(stringValue);
  const [showUrlField, setShowUrlField] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification, showSuccess, showError } = useNotification();

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      showNotification({
        type: 'error',
        title: 'Invalid File',
        message: 'Please drop an image file'
      });
    }
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      showError('Upload Error', 'Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Upload Error', 'Each image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(null);

    try {
      if (useCloudStorage) {
        // Use cloud storage
        const result = await StorageService.uploadImage(
          file,
          folder,
          (progress) => { setUploadProgress(progress); }
        );

        if (result.error) {
          showError('Upload Failed', result.error);
        } else {
          if (multiple) {
            onChange([...images, result.url]);
          } else {
            onChange(result.url);
          }
          onPathChange?.(result.path);
          setUrlInput(result.url);
          showSuccess('Upload Successful', 'Image uploaded successfully');
        }
      } else {
        // Use base64 encoding
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        if (multiple) {
          onChange([...images, base64]);
        } else {
          onChange(base64);
        }
        setUrlInput(base64);
        showSuccess('Upload Successful', 'Image uploaded successfully');
      }
    } catch (error) {
      showError('Upload Error', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (url) {
      onChange(url);
      setShowUrlField(false);
      showNotification({
        type: 'success',
        title: 'Image URL Updated',
        message: 'Image URL has been updated'
      });
    }
  };

  const handleRemoveImage = (index?: number) => {
    if (multiple && index !== undefined) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange(multiple ? [] : '');
      onPathChange?.('');
      setUrlInput('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraCapture = () => {
    try {
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment';
      cameraInput.multiple = multiple;

      cameraInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files) {
          Array.from(target.files).forEach(file => handleFileUpload(file));
        }
      };

      cameraInput.click();
    } catch (error) {
      showError('Camera Error', 'Failed to access camera');
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      default: return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Multiple Images Preview */}
      {multiple && images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square">
              <img
                src={img}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200/f3f4f6/9ca3af?text=Error';
                }}
              />
              {!disabled && (
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Single Image Preview or Upload Area */}
      <div className="relative">
        {!multiple && stringValue ? (
          <div className={`relative rounded-lg overflow-hidden border border-gray-200 ${getAspectRatioClass()}`}>
            <img
              src={stringValue}
              alt="Preview"
              className="w-full h-full object-cover"
              style={{ maxWidth, maxHeight }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=No+Image';
              }}
            />

            {/* Remove button */}
            {!disabled && (
              <button
                onClick={() => handleRemoveImage()}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Upload overlay when uploading */}
            <>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    {uploadProgress && (
                      <div className="text-sm">
                        {uploadProgress.percentage}%
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
              ${isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${getAspectRatioClass()}
            `}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(file => handleFileUpload(file));
                }
              }}
              className="hidden"
              disabled={disabled}
              multiple={multiple}
            />

            <div className="flex flex-col items-center justify-center h-full min-h-[120px]">
              {isUploading ? (
                <>
                  <Loader className="h-8 w-8 text-amber-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Uploading...</p>
                  {uploadProgress && (
                    <div className="mt-2 w-full max-w-xs">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {uploadProgress.percentage}%
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-4">{placeholder}</p>

                  {/* Upload buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                    <button
                      type="button"
                      className="flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-amber-600 px-4 py-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="p-2 bg-gray-100 rounded-full mb-1">
                        <Upload className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">Upload</span>
                    </button>

                    <button
                      type="button"
                      className="flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-amber-600 px-4 py-2"
                      onClick={handleCameraCapture}
                    >
                      <div className="p-2 bg-gray-100 rounded-full mb-1">
                        <Camera className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">Camera</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* URL Input Section */}
      {showUrlInput && !disabled && (
        <div className="space-y-2">
          {!showUrlField ? (
            <button
              onClick={() => setShowUrlField(true)}
              className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700"
            >
              <Link className="h-4 w-4" />
              <span>Or enter image URL</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setShowUrlField(false);
                  setUrlInput(stringValue);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper Text */}
      {helperText && images.length === 0 && !stringValue && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {/* Upload Status */}
      <>
        {isUploading && uploadProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-sm text-gray-600"
          >
            <Upload className="h-4 w-4 animate-pulse" />
            <span>
              Uploading... {uploadProgress.percentage}%
              ({Math.round(uploadProgress.loaded / 1024)}KB / {Math.round(uploadProgress.total / 1024)}KB)
            </span>
          </motion.div>
        )}
      </>
    </div>
  );
};
