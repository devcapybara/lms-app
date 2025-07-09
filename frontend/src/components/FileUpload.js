import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File, Download, Eye, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadAPI } from '../utils/api';

export default function FileUpload({ 
  onFilesUploaded, 
  existingFiles = [], 
  onFileDelete,
  maxFiles = 5,
  allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'],
  maxSize = 10 * 1024 * 1024, // 10MB
  uploadType = 'lesson-materials' // 'lesson-materials', 'course-image', 'cv', 'photo'
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (existingFiles.length + fileArray.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file yang dapat diupload`);
      return;
    }

    // Validate file types and sizes
    const validFiles = fileArray.filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error(`File type ${fileExtension} tidak didukung`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File ${file.name} terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('lessonMaterials', file);
      });

      let response;
      switch (uploadType) {
        case 'course-image':
          response = await uploadAPI.uploadCourseImage(formData);
          break;
        case 'lesson-materials':
          response = await uploadAPI.uploadLessonMaterials(formData);
          break;
        case 'cv':
          response = await uploadAPI.uploadCV(formData);
          break;
        case 'photo':
          response = await uploadAPI.uploadPhoto(formData);
          break;
        default:
          response = await uploadAPI.uploadLessonMaterials(formData);
      }

      if (response.data.success) {
        toast.success('File berhasil diupload');
        onFilesUploaded(response.data.files || [response.data]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Gagal upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canPreview = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Drag and drop file di sini, atau{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500 hover:text-blue-600 font-medium"
            disabled={uploading}
          >
            pilih file
          </button>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Maksimal {maxFiles} file, ukuran maksimal {maxSize / (1024 * 1024)}MB
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Tipe file: {allowedTypes.join(', ').toUpperCase()}
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.map(type => `.${type}`).join(',')}
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-blue-600 dark:text-blue-400">Uploading files...</span>
          </div>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Files yang sudah diupload:</h4>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.filename || file.originalName)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {file.originalName || file.filename}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canPreview(file.filename || file.originalName) && (
                    <a
                      href={uploadAPI.getFilePreviewUrl(file.filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-blue-500 hover:text-blue-600"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </a>
                  )}
                  
                  <a
                    href={uploadAPI.getFileUrl(file.filename)}
                    download
                    className="p-1 text-green-500 hover:text-green-600"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  
                  {onFileDelete && (
                    <button
                      onClick={() => onFileDelete(file)}
                      className="p-1 text-red-500 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 