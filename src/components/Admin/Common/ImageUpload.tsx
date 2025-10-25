import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, Camera } from 'lucide-react';
import { useNotification } from '../../../contexts/NotificationContext';

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  helperText?: string;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  label = 'Upload Images',
  helperText = 'Click to upload or drag and drop',
  accept = 'image/*'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useNotification();

  const images = Array.isArray(value) ? value : value ? [value] : [];

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (multiple && images.length + fileArray.length > maxFiles) {
      showError('Upload Error', `Maximum ${maxFiles} images allowed`);
      return;
    }

    // Check file types
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      showError('Upload Error', 'Only image files are allowed');
      return;
    }

    // Check file sizes (max 5MB per file)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showError('Upload Error', 'Each image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of fileArray) {
        // Convert to base64 for preview (in production, upload to cloud storage)
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64 = await base64Promise;
        uploadedUrls.push(base64);
      }

      if (multiple) {
        onChange([...images, ...uploadedUrls]);
      } else {
        onChange(uploadedUrls[0] || '');
      }

      showSuccess('Upload Success', 'Images uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload Error', 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    if (multiple) {
      const newImages = images.filter((_, i) => i !== index);
      onChange(newImages);
    } else {
      onChange('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  // Handle camera capture with better compatibility
  const handleCameraCapture = async () => {
    // Check if we're on a mobile device
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // On desktop, just use the file input
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
      }
      return;
    }

    // For mobile devices, try different approaches for camera access
    try {
      // Method 1: Create input with capture attribute
      const cameraInput = document.createElement('input');
      cameraInput.type = 'file';
      cameraInput.accept = 'image/*';
      cameraInput.capture = 'environment'; // Prefer rear camera
      cameraInput.multiple = multiple;
      
      // Add event listener
      cameraInput.onchange = (e) => {
        const target = e.target as HTMLInputElement;
        handleFileChange(target.files);
      };
      
      // Try to trigger click
      cameraInput.click();
    } catch (error) {
      // Fallback: Use regular file input if camera access fails
      console.warn('Camera access failed, falling back to file input:', error);
      if (fileInputRef.current) {
        fileInputRef.current.accept = 'image/*';
        fileInputRef.current.click();
      }
    }
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-amber-500 bg-amber-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileChange(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          {uploading ? (
            <>
              <Loader className="h-12 w-12 text-amber-500 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                {/* Upload from device button */}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-amber-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">Upload Image</span>
                </button>
                
                {/* Capture from camera button */}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center cursor-pointer text-gray-700 hover:text-amber-600"
                  onClick={handleCameraCapture}
                >
                  <div className="p-3 bg-gray-100 rounded-full mb-2">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium">Take Photo</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                {helperText}
              </p>
              <p className="text-xs text-gray-400 mt-1 text-center">
                {multiple ? `PNG, JPG, GIF up to 5MB (max ${maxFiles} files)` : 'PNG, JPG, GIF up to 5MB'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {/* Add More Button (for multiple uploads) */}
          {multiple && images.length < maxFiles && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-amber-500"
              >
                <Upload className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Upload</span>
              </button>
              
              <button
                type="button"
                onClick={handleCameraCapture}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-500 hover:bg-amber-50 transition-colors flex flex-col items-center justify-center text-gray-400 hover:text-amber-500"
              >
                <Camera className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Camera</span>
              </button>
            </div>
          )}
        </div>
      )}

      {helperText && images.length === 0 && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default ImageUpload;