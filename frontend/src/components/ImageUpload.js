import React, { useState, useRef } from 'react';
import { Upload, Edit, X, Image as ImageIcon } from 'lucide-react';
import ImageEditor from './ImageEditor';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ImageUpload = ({ value, onChange, className = '' }) => {
  const [showEditor, setShowEditor] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImageUrl(e.target.result);
        setShowEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToServer = async (imageBlob) => {
    try {
      const formData = new FormData();
      formData.append('courseImage', imageBlob, 'course-image.jpg');
      
      const response = await fetch(`${API_BASE_URL}/upload/course-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleEditorSave = async (editedImageUrl) => {
    try {
      // Convert base64 to blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();
      
      // Upload to server
      const imageUrl = await uploadImageToServer(blob);
      
      // Update form with server URL
      onChange(imageUrl);
      setShowEditor(false);
      setTempImageUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('Failed to save image: ' + error.message);
    }
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setTempImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (event) => {
    const url = event.target.value;
    // If it's an external URL, save directly
    if (url.startsWith('http')) {
      onChange(url);
    } else {
      // If it's a local path, add base URL
      onChange(url);
    }
  };

  const removeImage = () => {
    onChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Image Display */}
      {value && (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
            <img
              src={value}
              alt="Course cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden absolute inset-0 bg-gray-700 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Image not found</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-2 right-2 flex space-x-2">
            <button
              type="button"
              onClick={() => setShowEditor(true)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Edit image"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image File
          </label>
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </button>
            <span className="text-sm text-gray-400">
              JPG, PNG, WebP (max 5MB)
            </span>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or Enter Image URL
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={value}
              onChange={handleUrlChange}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/image.jpg"
            />
            {value && (
              <button
                type="button"
                onClick={() => setShowEditor(true)}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                title="Edit image"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Image Requirements Info */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Image Requirements:</h4>
                 <ul className="text-xs text-gray-400 space-y-1">
           <li>• Minimum size: 400x225px (16:9 aspect ratio)</li>
           <li>• Supported formats: JPG, PNG, WebP</li>
           <li>• Maximum file size: 5MB</li>
           <li>• High quality images recommended for better display</li>
         </ul>
      </div>

      {/* Image Editor Modal */}
      {showEditor && (
        <ImageEditor
          imageUrl={tempImageUrl || value}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}
    </div>
  );
};

export default ImageUpload; 