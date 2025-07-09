# File Upload System - LMS App

## Overview

Sistem file upload yang komprehensif untuk LMS app yang memungkinkan upload dan manajemen file untuk lesson materials dan course thumbnails.

## Fitur yang Diimplementasikan

### ✅ **Backend Features**

#### 1. **File Upload Middleware**
- **Location**: `backend/src/middlewares/upload.js`
- **Fitur**:
  - Upload course images (thumbnails)
  - Upload lesson materials (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images)
  - File validation (type, size)
  - Unique filename generation
  - Organized directory structure

#### 2. **Upload Routes**
- **Location**: `backend/src/routes/upload.js`
- **Endpoints**:
  - `POST /api/upload/course-image` - Upload course thumbnail
  - `POST /api/upload/lesson-materials` - Upload lesson materials
  - `GET /api/upload/lesson-materials/:filename` - Download file
  - `GET /api/upload/lesson-materials/:filename/preview` - Preview file (PDF, images)
  - `DELETE /api/upload/lesson-materials/:filename` - Delete file

#### 3. **Lesson Attachments API**
- **Location**: `backend/src/routes/lessons.js`
- **Endpoints**:
  - `POST /api/lessons/:id/attachments` - Add attachments to lesson
  - `DELETE /api/lessons/:id/attachments/:filename` - Remove attachment
  - `PUT /api/lessons/:id/attachments` - Update lesson attachments

#### 4. **Database Schema**
- **Lesson Model**: Sudah memiliki field `attachments` dengan struktur:
  ```javascript
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimeType: String
  }]
  ```

### ✅ **Frontend Features**

#### 1. **FileUpload Component**
- **Location**: `frontend/src/components/FileUpload.js`
- **Fitur**:
  - Drag & drop interface
  - Multiple file upload
  - File type validation
  - File size validation
  - Progress indicator
  - File preview/download
  - File deletion

#### 2. **API Integration**
- **Location**: `frontend/src/utils/api.js`
- **APIs**:
  - `uploadAPI.uploadCourseImage()` - Upload course thumbnail
  - `uploadAPI.uploadLessonMaterials()` - Upload lesson materials
  - `uploadAPI.getFileUrl()` - Get download URL
  - `uploadAPI.getFilePreviewUrl()` - Get preview URL
  - `lessonAttachmentsAPI` - Manage lesson attachments

#### 3. **UI Integration**
- **LessonManagement**: Upload materials saat create/edit lesson
- **LessonDetail**: Display dan download attachments
- **CreateCourse**: Upload course thumbnail

## File Types Supported

### Course Thumbnails
- **Types**: JPG, JPEG, PNG, GIF
- **Max Size**: 5MB
- **Storage**: `/uploads/course-images/`

### Lesson Materials
- **Types**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, JPEG, PNG, GIF
- **Max Size**: 10MB
- **Max Files**: 5 per lesson
- **Storage**: `/uploads/lesson-materials/`

## Directory Structure

```
backend/uploads/
├── course-images/     # Course thumbnails
├── lesson-materials/  # Lesson attachments
├── cv/               # User CV files
└── photo/            # User profile photos
```

## Usage Examples

### 1. Upload Course Thumbnail

```javascript
// Frontend
import { uploadAPI } from '../utils/api';

const formData = new FormData();
formData.append('courseImage', file);

const response = await uploadAPI.uploadCourseImage(formData);
console.log(response.data.imageUrl);
```

### 2. Upload Lesson Materials

```javascript
// Frontend
import { uploadAPI, lessonAttachmentsAPI } from '../utils/api';

// Upload files
const formData = new FormData();
files.forEach(file => {
  formData.append('lessonMaterials', file);
});

const response = await uploadAPI.uploadLessonMaterials(formData);

// Add to lesson
await lessonAttachmentsAPI.addAttachments(lessonId, response.data.files);
```

### 3. Display Attachments

```javascript
// Frontend - LessonDetail.js
{lesson.attachments.map((attachment, index) => (
  <div key={index}>
    <a href={uploadAPI.getFileUrl(attachment.filename)} download>
      {attachment.originalName}
    </a>
    {canPreview(attachment.filename) && (
      <a href={uploadAPI.getFilePreviewUrl(attachment.filename)} target="_blank">
        Preview
      </a>
    )}
  </div>
))}
```

## Security Features

### 1. **File Validation**
- File type validation
- File size limits
- MIME type checking

### 2. **Access Control**
- Authentication required for uploads
- Role-based access (teacher/admin only)
- Course enrollment check for downloads

### 3. **File Security**
- Unique filename generation
- Secure file paths
- No direct file system access

## Error Handling

### Backend Errors
```javascript
// File too large
{ message: 'File too large. Maximum size is 10MB for lesson materials and 5MB for images.' }

// Invalid file type
{ message: 'File type not allowed. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, Images' }

// Too many files
{ message: 'Too many files. Maximum 5 files allowed per lesson.' }
```

### Frontend Errors
- Toast notifications for upload errors
- Progress indicators
- File validation feedback

## Performance Optimizations

### 1. **File Streaming**
- Direct file streaming for downloads
- No memory buffering for large files

### 2. **Efficient Storage**
- Local file system storage
- Organized directory structure
- Automatic cleanup of old files

### 3. **Caching**
- Static file serving with Express
- Browser caching for images

## Future Enhancements

### 1. **Cloud Storage**
- AWS S3 integration
- CDN for global access
- Automatic backup

### 2. **Advanced Features**
- File compression
- Image resizing
- Video transcoding
- Document preview (Google Docs style)

### 3. **Security Enhancements**
- Virus scanning
- File encryption
- Signed URLs
- Rate limiting

## Testing

### Manual Testing Checklist

- [ ] Upload course thumbnail (JPG, PNG)
- [ ] Upload lesson materials (PDF, DOC, DOCX)
- [ ] File size validation (5MB, 10MB limits)
- [ ] File type validation
- [ ] Multiple file upload (max 5)
- [ ] File preview (PDF, images)
- [ ] File download
- [ ] File deletion
- [ ] Drag & drop interface
- [ ] Progress indicators
- [ ] Error handling
- [ ] Access control (teacher/admin only)

### API Testing

```bash
# Upload course image
curl -X POST http://localhost:5000/api/upload/course-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "courseImage=@image.jpg"

# Upload lesson materials
curl -X POST http://localhost:5000/api/upload/lesson-materials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "lessonMaterials=@document.pdf" \
  -F "lessonMaterials=@presentation.pptx"

# Download file
curl http://localhost:5000/api/upload/lesson-materials/filename.pdf

# Preview file
curl http://localhost:5000/api/upload/lesson-materials/filename.pdf/preview
```

## Troubleshooting

### Common Issues

1. **File not uploading**
   - Check file size limits
   - Verify file type is allowed
   - Ensure authentication token is valid

2. **File not downloading**
   - Check file exists in uploads directory
   - Verify file permissions
   - Check URL path is correct

3. **Preview not working**
   - Only PDF and images support preview
   - Check browser supports file type
   - Verify Content-Type headers

### Debug Commands

```bash
# Check uploads directory
ls -la backend/uploads/

# Check file permissions
chmod 755 backend/uploads/lesson-materials/

# Test file serving
curl -I http://localhost:5000/api/upload/lesson-materials/test.pdf
```

## Dependencies

### Backend
```json
{
  "multer": "^1.4.5-lts.1",
  "express": "^4.18.2"
}
```

### Frontend
```json
{
  "axios": "^1.4.0",
  "react-hot-toast": "^2.4.1",
  "lucide-react": "^0.263.1"
}
```

## Conclusion

Sistem file upload yang komprehensif telah berhasil diimplementasikan dengan fitur-fitur:

✅ **File upload untuk lesson materials (PDF, documents)**  
✅ **Image upload untuk course thumbnails**  
✅ **File storage management**  
✅ **File preview/download functionality**  

Sistem ini memberikan pengalaman yang baik untuk teachers dalam mengelola materi pelajaran dan untuk students dalam mengakses materi tambahan. 