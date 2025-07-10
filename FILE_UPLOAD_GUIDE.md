# File Upload Guide

## Overview
LMS App menggunakan **Cloudinary** untuk file storage. Semua file upload (CV, foto, materi pelajaran, course images) disimpan di cloud dengan otomatis optimization.

## Architecture

### File Storage
- **Service**: Cloudinary
- **Location**: `backend/src/config/cloudinary.js`
- **Benefits**: 
  - Otomatis image optimization
  - CDN global
  - Transformasi gambar real-time
  - Backup otomatis

### File Types & Storage

#### 1. Course Images
- **Storage**: `lms/course-images/` (Cloudinary)
- **Formats**: jpg, jpeg, png, gif, webp
- **Transformations**: 
  - Resize: 800x600
  - Quality: auto
- **Usage**: Course thumbnails

#### 2. Lesson Materials
- **Storage**: `lms/lesson-materials/` (Cloudinary)
- **Formats**: pdf, doc, docx, ppt, pptx, xls, xlsx, txt, jpg, jpeg, png, gif
- **Usage**: Course materials, documents

#### 3. User CV
- **Storage**: `lms/cv/` (Cloudinary)
- **Formats**: pdf only
- **Usage**: User CV/portfolio

#### 4. User Photos
- **Storage**: `lms/photos/` (Cloudinary)
- **Formats**: jpg, jpeg, png, gif, webp
- **Transformations**:
  - Resize: 300x300 (square)
  - Quality: auto
- **Usage**: User profile photos

## API Endpoints

### Upload Endpoints
```javascript
// Course Image
POST /api/upload/course-image
Content-Type: multipart/form-data
Body: { courseImage: file }

// Lesson Materials
POST /api/upload/lesson-materials
Content-Type: multipart/form-data
Body: { lessonMaterials: [files] }

// User CV
POST /api/upload/cv
Content-Type: multipart/form-data
Body: { cv: file }

// User Photo
POST /api/upload/photo
Content-Type: multipart/form-data
Body: { photo: file }
```

### Delete Endpoints
```javascript
// Delete Lesson Material
DELETE /api/upload/lesson-materials/:publicId

// Delete CV
DELETE /api/upload/cv

// Delete Photo
DELETE /api/upload/photo
```

## Frontend Integration

### File Upload Component
```javascript
import { uploadAPI } from '../utils/api';

// Upload course image
const formData = new FormData();
formData.append('courseImage', file);
const response = await uploadAPI.uploadCourseImage(formData);
console.log(response.data.imageUrl); // Cloudinary URL
```

### File Display
```javascript
// Images are served directly from Cloudinary
<img src="https://res.cloudinary.com/cloud-name/image/upload/..." />
```

## Environment Variables

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Security Features

1. **File Type Validation**: Hanya format yang diizinkan
2. **File Size Limits**: 
   - Course images: 5MB
   - Lesson materials: 10MB
   - CV: 5MB
   - Photos: 2MB
3. **Automatic Cleanup**: File lama dihapus otomatis saat upload baru
4. **Cloud Storage**: Tidak ada path traversal risk

## Migration from Local Storage

### Before (Local)
```javascript
// Local file path
thumbnail: "/uploads/course-123456.jpg"
```

### After (Cloudinary)
```javascript
// Cloudinary URL
thumbnail: "https://res.cloudinary.com/cloud-name/image/upload/v123456789/lms/course-images/course-123456.jpg"
```

## Benefits of Cloudinary

1. **Performance**: CDN global, fast loading
2. **Optimization**: Auto-resize, format conversion
3. **Reliability**: 99.9% uptime
4. **Security**: HTTPS, signed URLs
5. **Cost**: Free tier 25GB storage, 25GB bandwidth/month
6. **Scalability**: Auto-scaling

## Troubleshooting

### Common Issues

1. **Upload Failed**
   - Check file size limits
   - Verify file format
   - Check Cloudinary credentials

2. **Image Not Loading**
   - Verify Cloudinary URL format
   - Check CORS settings
   - Ensure file exists in Cloudinary

3. **Delete Failed**
   - Check public_id format
   - Verify file exists
   - Check Cloudinary permissions 