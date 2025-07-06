const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Get the correct image URL for display
 * @param {string} imagePath - Image path from database
 * @returns {string} - Full URL for image display
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's a local upload path, add server URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, assume it's local
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Check if image URL is external
 * @param {string} imagePath - Image path from database
 * @returns {boolean} - True if external URL
 */
export const isExternalImage = (imagePath) => {
  if (!imagePath) return false;
  return imagePath.startsWith('http://') || imagePath.startsWith('https://');
};

/**
 * Get image filename from path
 * @param {string} imagePath - Image path from database
 * @returns {string} - Filename
 */
export const getImageFilename = (imagePath) => {
  if (!imagePath) return null;
  
  // Extract filename from path
  const pathParts = imagePath.split('/');
  return pathParts[pathParts.length - 1];
};

/**
 * Validate image URL
 * @param {string} imagePath - Image path to validate
 * @returns {boolean} - True if valid
 */
export const isValidImageUrl = (imagePath) => {
  if (!imagePath) return false;
  
  // Check if it's a valid URL or local path
  const urlPattern = /^https?:\/\/.+/;
  const localPathPattern = /^\/uploads\/.+/;
  
  return urlPattern.test(imagePath) || localPathPattern.test(imagePath);
}; 