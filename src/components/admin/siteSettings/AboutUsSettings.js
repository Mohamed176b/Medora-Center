import React from "react";
import ButtonLoader from "./ButtonLoader";
import ImagePreview from "./ImagePreview";

const AboutUsSettings = React.memo(({
  formData,
  handleChange,
  centerImageFile,
  centerImagePreview,
  centerImageRef,
  handleSubmit,
  canEdit,
  saving,
  getImageNameFromUrl,
  handleImageChange,
}) => {
  return (
    <form onSubmit={handleSubmit} className="site-settings-form">
      <div className="form-group">
        <label>نص قصير عن تاريخ أو هدف المركز</label>
        <textarea
          name="short_history"
          value={formData.short_history || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group image-form-group">
        <label>صورة المركز</label>
        <div className="image-upload-container">
          <ImagePreview
            url={centerImagePreview || formData.center_image_url}
            alt="صورة المركز"
            onUploadClick={() => centerImageRef.current.click()}
            canEdit={canEdit}
          />
          {formData.center_image_url && !centerImagePreview && (
            <div className="current-image-name">
              الصورة الحالية: {getImageNameFromUrl(formData.center_image_url)}
            </div>
          )}
          {canEdit && (
            <input
              type="file"
              name="center_image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!canEdit || saving}
              ref={centerImageRef}
              className="file-input hidden"
            />
          )}
          {centerImageFile && (
            <div className="selected-file-info">
              تم اختيار: {centerImageFile.name}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>هدف المركز على المدى البعيد</label>
        <textarea
          name="long_term_goal"
          value={formData.long_term_goal || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>رسالة المركز</label>
        <textarea
          name="mission_statement"
          value={formData.mission_statement || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>عدد المرضى الذين خدمهم المركز</label>
        <input
          type="number"
          name="patients_served_count"
          value={formData.patients_served_count || 0}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>عدد الأقسام</label>
        <input
          type="number"
          name="departments_count"
          value={formData.departments_count || 0}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      {canEdit && (
        <div className="form-actions">
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? (
              <ButtonLoader />
            ) : (
              <>
                <i className="fas fa-save"></i>
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
});


export default AboutUsSettings;

