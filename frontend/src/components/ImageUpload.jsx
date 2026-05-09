import { useState, useRef } from 'react';
import ApiService from '../services/api';
import './ImageUpload.css';

const ImageUpload = ({ currentImage, onImageUpload, type = 'cover' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return false;
    }
    return true;
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        await uploadFile(file);
      }
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        await uploadFile(file);
      }
    }
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    setError('');
    
    // Create local preview instantly
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const response = await ApiService.uploadImage(file, type);
      onImageUpload(response.data.url);
    } catch (err) {
      setError(err.message || 'Failed to upload image. Please try again.');
      setPreviewUrl(currentImage || null); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={`image-upload-container ${type}`}>
      <div 
        className={`drop-zone ${isDragging ? 'drag-active' : ''} ${previewUrl ? 'has-preview' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerSelect}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleChange} 
          style={{ display: 'none' }} 
        />
        
        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Preview" className="image-preview" />
            <div className="preview-overlay">
              <span className="overlay-text">
                {isUploading ? 'Uploading...' : 'Click or Drag to change'}
              </span>
            </div>
            {isUploading && <div className="upload-progress-bar"><div className="progress-fill"></div></div>}
          </div>
        ) : (
          <div className="empty-upload-state">
            <span className="upload-icon">📸</span>
            <p>Drag & drop an image here</p>
            <span className="upload-hint">or click to browse files (Max 5MB)</span>
          </div>
        )}
      </div>
      {error && <div className="upload-error">{error}</div>}
    </div>
  );
};

export default ImageUpload;
