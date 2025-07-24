import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../utils/AuthContext';

const PlatformBranding = ({ children }) => {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: 'LMS Platform',
    logo: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      const response = await fetch('/api/platform-settings');
      const data = await response.json();
      
      if (data.success) {
        setPlatformSettings(data.data);
        
        // Update document title
        document.title = data.data.platformName;
        
        // Update favicon if exists
        if (data.data.favicon) {
          updateFavicon(data.data.favicon);
        }
        
        // Update CSS custom properties for theming
        updateThemeColors(data.data.primaryColor, data.data.secondaryColor);
      }
    } catch (error) {
      console.error('Error fetching platform settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFavicon = (faviconUrl) => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  const updateThemeColors = (primaryColor, secondaryColor) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--secondary-color', secondaryColor);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="platform-branding">
      {React.cloneElement(children, { platformSettings })}
    </div>
  );
};

export default PlatformBranding;