import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { uploadAPI } from '../../utils/api';

const PlatformSettings = () => {
  const [settings, setSettings] = useState({
    platformName: '',
    description: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    logo: '',
    favicon: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/platform-settings/admin', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        setLogoPreview(data.data.logo);
        setFaviconPreview(data.data.favicon);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal mengambil pengaturan platform');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setSettings(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = type === 'logo' 
      ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      : ['image/x-icon', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`Format file ${type} tidak didukung`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ukuran file ${type} maksimal 5MB`);
      return;
    }

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch(`/api/platform-settings/admin/upload-${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload logo if changed
      if (logoFile) {
        setUploading(true);
        const logoData = await uploadFile(logoFile, 'logo');
        setSettings(prev => ({ ...prev, logo: logoData.logo }));
        setLogoFile(null);
        toast.success('Logo berhasil diupload');
      }

      // Upload favicon if changed
      if (faviconFile) {
        setUploading(true);
        const faviconData = await uploadFile(faviconFile, 'favicon');
        setSettings(prev => ({ ...prev, favicon: faviconData.favicon }));
        setFaviconFile(null);
        toast.success('Favicon berhasil diupload');
      }

      // Update settings
      const response = await fetch('/api/platform-settings/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        toast.success('Pengaturan platform berhasil diperbarui');
        
        // Update document title
        document.title = `${data.data.platformName} - Admin`;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Gagal memperbarui pengaturan');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const handleDeleteFile = async (type) => {
    try {
      const response = await fetch(`/api/platform-settings/admin/${type}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (type === 'logo') {
          setSettings(prev => ({ ...prev, logo: '' }));
          setLogoPreview('');
        } else {
          setSettings(prev => ({ ...prev, favicon: '' }));
          setFaviconPreview('');
        }
        toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} berhasil dihapus`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(`Gagal menghapus ${type}`);
    }
  };

  if (loading && !settings.platformName) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pengaturan Platform</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Platform *
              </label>
              <input
                type="text"
                name="platformName"
                value={settings.platformName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Kontak
              </label>
              <input
                type="email"
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Platform
            </label>
            <textarea
              name="description"
              value={settings.description}
              onChange={handleInputChange}
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              {settings.description.length}/200 karakter
            </p>
          </div>

          {/* Logo Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Platform
              </label>
              <div className="space-y-4">
                {logoPreview && (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-20 object-contain border border-gray-300 rounded-md p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('logo')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Format: JPG, PNG, GIF, WebP, SVG. Maksimal 5MB.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon
              </label>
              <div className="space-y-4">
                {faviconPreview && (
                  <div className="relative">
                    <img
                      src={faviconPreview}
                      alt="Favicon Preview"
                      className="h-8 w-8 object-contain border border-gray-300 rounded-md p-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteFile('favicon')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept=".ico,image/png,image/gif"
                  onChange={(e) => handleFileChange(e, 'favicon')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500">
                  Format: ICO, PNG, GIF. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warna Primer
              </label>
              <input
                type="color"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warna Sekunder
              </label>
              <input
                type="color"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleInputChange}
                className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={settings.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleInputChange}
                maxLength={300}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Media Sosial</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(settings.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {platform}
                  </label>
                  <input
                    type="url"
                    name={`socialMedia.${platform}`}
                    value={url}
                    onChange={handleInputChange}
                    placeholder={`https://${platform}.com/username`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading || uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Mengupload...' : 'Menyimpan...'}
                </div>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlatformSettings;