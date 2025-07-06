import React, { useState, useRef } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, RotateCw, Download, Check, AlertCircle } from 'lucide-react';

const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 80,
    height: 60,
    x: 10,
    y: 20
  });
  const [rotation, setRotation] = useState(0);
  const [imageSrc, setImageSrc] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const imgRef = useRef(null);

  // Minimum dimensions for course cover (16:9 aspect ratio recommended)
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 225;
  const RECOMMENDED_ASPECT_RATIO = 16 / 9;

  const handleImageLoad = (e) => {
    const { width, height } = e.target;
    
    // Check if image meets minimum requirements
    if (width < MIN_WIDTH || height < MIN_HEIGHT) {
      setError(`Image too small. Minimum size: ${MIN_WIDTH}x${MIN_HEIGHT}px. Current: ${width}x${height}px`);
    } else {
      setError('');
    }

    // Set initial crop to center with recommended aspect ratio
    const aspectRatio = width / height;
    let cropWidth, cropHeight;

    if (aspectRatio > RECOMMENDED_ASPECT_RATIO) {
      // Image is wider than 16:9, crop width
      cropHeight = 80;
      cropWidth = (RECOMMENDED_ASPECT_RATIO * cropHeight * height) / width;
    } else {
      // Image is taller than 16:9, crop height
      cropWidth = 80;
      cropHeight = (cropWidth * width) / (RECOMMENDED_ASPECT_RATIO * height);
    }

    setCrop({
      unit: '%',
      width: cropWidth,
      height: cropHeight,
      x: (100 - cropWidth) / 2,
      y: (100 - cropHeight) / 2
    });
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const getCroppedImg = () => {
    if (!imgRef.current) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    const img = imgRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Calculate crop dimensions
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Set canvas size to crop size
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    // Apply rotation if needed
    if (rotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Draw cropped image
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    if (rotation !== 0) {
      ctx.restore();
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const croppedBlob = await getCroppedImg();
      if (croppedBlob) {
        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          onSave(reader.result);
        };
        reader.readAsDataURL(croppedBlob);
      }
    } catch (err) {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Edit Cover Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Image Requirements */}
        <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300">
              <p className="font-medium">Image Requirements:</p>
              <ul className="mt-1 space-y-1">
                <li>• Minimum size: <span className="font-mono">{MIN_WIDTH}x{MIN_HEIGHT}px</span></li>
                <li>• Recommended aspect ratio: <span className="font-mono">16:9</span></li>
                <li>• Supported formats: JPG, PNG, WebP</li>
                <li>• Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-900 border-b border-red-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Image Editor */}
        <div className="p-4 overflow-auto max-h-[60vh]">
          <div className="flex justify-center">
            <div className="relative">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={RECOMMENDED_ASPECT_RATIO}
                minWidth={200}
                minHeight={112}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Course cover"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    maxWidth: '100%',
                    maxHeight: '400px'
                  }}
                  onLoad={handleImageLoad}
                  className="rounded-lg"
                />
              </ReactCrop>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <button
              onClick={rotateImage}
              className="flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !!error}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor; 