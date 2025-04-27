import React from "react";

// Image preview component
const ImagePreview = ({ url, alt, onUploadClick, canEdit }) => {
  if (!url) {
    return (
      <div className="image-placeholder">
        {canEdit && (
          <button 
            type="button" 
            className="image-upload-icon" 
            onClick={onUploadClick}
            title="اختر صورة"
          >
            <i className="fas fa-cloud-upload-alt"></i>
          </button>
        )}
        <i className="fas fa-image image-icon"></i>
        <span>لا توجد صورة</span>
      </div>
    );
  }
  
  return (
    <div className="image-preview-container">
      <img src={url} alt={alt} className="image-preview" />
      {canEdit && (
        <button 
          type="button" 
          className="image-upload-icon" 
          onClick={onUploadClick}
          title="تغيير الصورة"
        >
          <i className="fas fa-camera"></i>
        </button>
      )}
    </div>
  );
};

export default ImagePreview; 