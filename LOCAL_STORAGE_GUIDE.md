# Implementasi Penyimpanan Gambar Lokal

## 🎯 **Overview**

Sistem ini menyimpan gambar course di folder lokal server dan hanya menyimpan path/URL di database MongoDB. Ini menghemat storage MongoDB Atlas dan cocok untuk aplikasi skala kecil-menengah.

## 📁 **Struktur Penyimpanan**

```
backend/
├── uploads/
│   └── course-images/
│       ├── course-1703123456789-123456789.jpg
│       ├── course-1703123456790-987654321.png
│       └── ...
└── src/
    ├── middlewares/
    │   └── upload.js          # Multer configuration
    └── routes/
        └── upload.js          # Upload endpoints
```

## 🔧 **Implementasi Backend**

### **1. Multer Middleware (`upload.js`)**
- **Storage**: Local disk storage
- **Destination**: `uploads/course-images/`
- **Filename**: `course-{timestamp}-{random}.{ext}`
- **File Filter**: Hanya image files
- **Size Limit**: 5MB
- **Min Dimensions**: 400x225px

### **2. Upload Routes (`upload.js`)**
- **POST** `/api/upload/course-image` - Upload image
- **GET** `/api/upload/course-images/:filename` - Serve image

### **3. File Naming Convention**
```javascript
// Format: course-{timestamp}-{random}.{extension}
// Example: course-1703123456789-123456789.jpg
```

## 📊 **Database Schema**

### **Course Document di MongoDB:**
```javascript
{
  _id: ObjectId("..."),
  title: "Course Title",
  description: "Course Description",
  image: "/uploads/course-images/course-1703123456789-123456789.jpg", // Local path
  // atau
  image: "https://example.com/external-image.jpg", // External URL
  price: 299000,
  // ... field lainnya
}
```

## 🚀 **API Endpoints**

### **Upload Image**
```http
POST /api/upload/course-image
Content-Type: multipart/form-data

Form Data:
- courseImage: [file]
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/course-images/course-1703123456789-123456789.jpg",
  "filename": "course-1703123456789-123456789.jpg"
}
```

### **Get Image**
```http
GET /api/upload/course-images/{filename}
```

## 💾 **Keuntungan Penyimpanan Lokal**

### **✅ Pros:**
- **Murah**: Tidak ada biaya cloud storage
- **Cepat**: Akses file langsung dari server
- **Kontrol penuh**: Full control atas file
- **MongoDB hemat**: Hanya simpan path, bukan base64
- **Simple**: Tidak perlu setup cloud service

### **❌ Cons:**
- **Backup manual**: Perlu backup folder uploads
- **Server storage**: Bergantung pada kapasitas server
- **Scaling**: Sulit untuk multiple server
- **Maintenance**: Perlu manage file cleanup

## 🔄 **Workflow Upload**

### **1. User Upload File:**
1. User pilih file di frontend
2. File dibuka di image editor
3. User crop/edit gambar
4. Klik "Save Image"

### **2. Frontend Processing:**
1. Convert edited image ke blob
2. Create FormData dengan file
3. Send POST request ke `/api/upload/course-image`

### **3. Backend Processing:**
1. Multer validate dan save file
2. Generate unique filename
3. Return image URL path
4. Save URL ke database

### **4. Database Storage:**
```javascript
// Hanya simpan path, bukan base64
{
  image: "/uploads/course-images/course-1703123456789-123456789.jpg"
}
```

## 🛠️ **Setup & Configuration**

### **1. Install Dependencies:**
```bash
cd backend
npm install multer
```

### **2. Create Upload Directory:**
```bash
mkdir -p uploads/course-images
```

### **3. Add to .gitignore:**
```gitignore
# Uploads
uploads/
!uploads/.gitkeep
```

### **4. Environment Variables:**
```env
# Backend .env
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

## 📱 **Frontend Integration**

### **ImageUpload Component:**
- Handle file selection
- Open image editor
- Upload to backend
- Update form with server URL

### **Image Display:**
```jsx
// Display local image
<img src={`http://localhost:5000${course.image}`} alt="Course cover" />

// Display external image
<img src={course.image} alt="Course cover" />

// Using utility function (recommended)
<img src={getImageUrl(course.image)} alt="Course cover" />
```

## 🔒 **Security Considerations**

### **1. File Validation:**
- Check file type (image only)
- Validate file size (5MB limit)
- Scan for malware (optional)

### **2. Access Control:**
- Authenticate upload requests
- Validate user permissions
- Rate limiting

### **3. File Cleanup:**
- Delete old unused files
- Cleanup on course deletion
- Regular maintenance

## 📈 **Performance Optimization**

### **1. Image Compression:**
```javascript
// Add compression before save
const sharp = require('sharp');
const compressedBuffer = await sharp(file.buffer)
  .resize(1200, 675, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer();
```

### **2. Caching:**
```javascript
// Add cache headers
res.setHeader('Cache-Control', 'public, max-age=31536000');
```

### **3. CDN Integration:**
```javascript
// Future: Integrate with CDN
const cdnUrl = process.env.CDN_URL;
const imageUrl = `${cdnUrl}/uploads/course-images/${filename}`;
```

## 🚀 **Deployment Considerations**

### **1. Production Setup:**
- Use absolute paths for uploads
- Configure proper file permissions
- Setup backup strategy

### **2. Docker Configuration:**
```dockerfile
# Create uploads volume
VOLUME /app/uploads
```

### **3. Environment Variables:**
```env
# Production .env
UPLOAD_PATH=/app/uploads
NODE_ENV=production
```

## 📋 **Maintenance Tasks**

### **1. Regular Cleanup:**
```javascript
// Cleanup unused images
const cleanupUnusedImages = async () => {
  // Find images not referenced in database
  // Delete orphaned files
};
```

### **2. Backup Strategy:**
```bash
# Backup uploads folder
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
```

### **3. Monitoring:**
- Monitor disk usage
- Track upload statistics
- Error logging

## 🎯 **Best Practices**

### **1. File Management:**
- Use unique filenames
- Implement cleanup routines
- Monitor storage usage

### **2. Error Handling:**
- Graceful error responses
- Log upload failures
- User-friendly messages

### **3. Performance:**
- Compress images
- Use appropriate formats
- Implement caching

## 🔮 **Future Enhancements**

### **1. Cloud Migration:**
- Easy migration to cloud storage
- Hybrid approach (local + cloud)
- CDN integration

### **2. Advanced Features:**
- Image optimization
- Multiple image sizes
- Watermarking
- AI enhancement

### **3. Monitoring:**
- Upload analytics
- Storage monitoring
- Performance metrics 