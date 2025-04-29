import React from "react";
import ButtonLoader from "./ButtonLoader";
import ImagePreview from "./ImagePreview";

const HomeSettings = React.memo(({
  formData,
  handleChange,
  backgroundImageFile,
  backgroundImagePreview,
  backgroundImageRef,
  handleSubmit,
  canEdit,
  saving,
  getImageNameFromUrl,
  handleImageChange,
}) => {
  return (
    <form onSubmit={handleSubmit} className="site-settings-form">
      <div className="form-group image-form-group">
        <label>صورة الخلفية</label>
        <div className="image-upload-container">
          <ImagePreview
            url={backgroundImagePreview || formData.background_image_url}
            alt="صورة الخلفية"
            onUploadClick={() => backgroundImageRef.current.click()}
            canEdit={canEdit}
          />
          {formData.background_image_url && !backgroundImagePreview && (
            <div className="current-image-name">
              الصورة الحالية:{" "}
              {getImageNameFromUrl(formData.background_image_url)}
            </div>
          )}
          {canEdit && (
            <input
              type="file"
              name="background_image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={!canEdit || saving}
              ref={backgroundImageRef}
              className="file-input hidden"
            />
          )}
          {backgroundImageFile && (
            <div className="selected-file-info">
              تم اختيار: {backgroundImageFile.name}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>العنوان الجذاب</label>
        <input
          type="text"
          name="catchy_title"
          value={formData.catchy_title || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>وصف بسيط</label>
        <textarea
          name="simple_description"
          value={formData.simple_description || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>نبذة عن المركز</label>
        <textarea
          name="center_overview"
          value={formData.center_overview || ""}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>عدد سنوات الخبرة</label>
        <input
          type="number"
          name="years_experience"
          value={formData.years_experience || 0}
          onChange={handleChange}
          disabled={!canEdit}
        />
      </div>

      <div className="form-group">
        <label>لماذا يختاروننا المرضى</label>
        <textarea
          name="why_choose_us"
          value={formData.why_choose_us || ""}
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

export default HomeSettings;

