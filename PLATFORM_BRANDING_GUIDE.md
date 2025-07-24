# Platform Branding Feature

Fitur ini memungkinkan admin untuk mengkustomisasi branding platform LMS, termasuk:

## 🎨 **Fitur Platform Branding**

### **1. Pengaturan Dasar**
- ✅ **Nama Platform**: Dapat diubah sesuai kebutuhan
- ✅ **Deskripsi Platform**: Tagline atau deskripsi singkat
- ✅ **Logo Upload**: Upload logo dengan auto-resize
- ✅ **Favicon Upload**: Upload favicon untuk browser tab

### **2. Kustomisasi Warna**
- ✅ **Warna Primer**: Untuk elemen utama UI
- ✅ **Warna Sekunder**: Untuk elemen pendukung
- ✅ **Live Preview**: Perubahan warna langsung terlihat

### **3. Informasi Kontak**
- ✅ **Email Kontak**: Email untuk customer support
- ✅ **Nomor Telepon**: Kontak telepon
- ✅ **Alamat**: Alamat fisik perusahaan

### **4. Media Sosial**
- ✅ **Facebook**: Link profil Facebook
- ✅ **Twitter**: Link profil Twitter
- ✅ **Instagram**: Link profil Instagram
- ✅ **LinkedIn**: Link profil LinkedIn
- ✅ **YouTube**: Link channel YouTube

## 🛠️ **Implementasi Teknis**

### **Backend Components**
- `PlatformSettings.js` - Model database untuk pengaturan
- `platformSettings.js` - Routes API untuk CRUD operations
- `cloudinary.js` - Updated dengan logo storage config

### **Frontend Components**
- `PlatformSettings.js` - Admin interface untuk pengaturan
- `PlatformBranding.js` - Component untuk apply branding
- Updated `App.js` - Route untuk platform settings

### **Database Schema**
```javascript
{
  platformName: String,
  logo: String,
  logoPublicId: String,
  favicon: String,
  faviconPublicId: String,
  primaryColor: String,
  secondaryColor: String,
  description: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
    youtube: String
  }
}
```

## 🚀 **API Endpoints**

### **Public Endpoints**
- `GET /api/platform-settings` - Get platform settings (public)

### **Admin Endpoints**
- `GET /api/platform-settings/admin` - Get settings for admin
- `PUT /api/platform-settings/admin` - Update platform settings
- `POST /api/platform-settings/admin/upload-logo` - Upload logo
- `POST /api/platform-settings/admin/upload-favicon` - Upload favicon
- `DELETE /api/platform-settings/admin/logo` - Delete logo
- `DELETE /api/platform-settings/admin/favicon` - Delete favicon

## 🔒 **Security Features**

### **File Upload Security**
- ✅ **File Type Validation**: Only allowed image formats
- ✅ **File Size Limits**: Maximum 5MB per file
- ✅ **Cloudinary Storage**: Secure cloud storage
- ✅ **Auto-cleanup**: Old files deleted when replaced

### **Access Control**
- ✅ **Admin Only**: Only admin role can modify settings
- ✅ **JWT Authentication**: Secure API access
- ✅ **Input Validation**: Server-side validation for all inputs

## 📱 **Usage Instructions**

### **For Admins**
1. Login sebagai admin
2. Navigate ke `/platform-settings`
3. Update nama platform, logo, dan pengaturan lainnya
4. Klik "Simpan Pengaturan"
5. Perubahan akan langsung terlihat di seluruh aplikasi

### **For Developers**
1. Platform settings tersedia di semua component melalui props
2. Logo dan nama platform otomatis update di header
3. Warna tema tersedia sebagai CSS custom properties
4. Favicon otomatis update di browser tab

## 🎯 **White-Label Ready**

Fitur ini membuat LMS siap untuk dijual sebagai white-label solution:
- ✅ **Complete Branding Control**: Logo, nama, warna
- ✅ **Professional Appearance**: Consistent branding
- ✅ **Easy Customization**: Admin-friendly interface
- ✅ **Scalable Architecture**: Support multiple tenants

## 🔄 **Future Enhancements**

Potential improvements:
- Multiple theme templates
- Advanced color scheme editor
- Custom CSS injection
- Multi-language support
- Tenant-specific domains