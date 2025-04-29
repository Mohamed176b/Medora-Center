import React, { memo } from "react";
import IconSelector from "./IconSelector";
import ButtonLoader from "../../admin/siteSettings/ButtonLoader";
import availableIcons from "./serviceIcons";
import styles from "../../../style/ServicesManagement.module.css";

const ServiceForm = ({
  formData,
  handleChange,
  handleSubmit,
  handleIconSelect,
  iconSearch,
  setIconSearch,
  resetForm,
  editMode,
  saving,
  canEdit,
}) => {
  return (
    <div className={styles["form-container"]}>
      <h3>{editMode ? "تعديل خدمة" : "إضافة خدمة جديدة"}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor="title">عنوان الخدمة *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={!canEdit}
          />
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="description">وصف الخدمة *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            disabled={!canEdit}
          ></textarea>
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="slug">
            الرابط المميز (سيتم توليده تلقائيًا إذا تركته فارغًا)
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            disabled={!canEdit}
          />
        </div>

        <div className={styles["form-group"]}>
          <label className={styles["checkbox-label"]}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={!canEdit}
            />
            نشط
          </label>
        </div>

        <IconSelector
          availableIcons={availableIcons}
          selectedIcon={formData.icon}
          onIconSelect={handleIconSelect}
          iconSearch={iconSearch}
          setIconSearch={setIconSearch}
          canEdit={canEdit}
        />

        {canEdit && (
          <div className={styles["form-actions"]}>
            <button
              type="button"
              className={`${styles.btn} ${styles["btn-secondary"]}`}
              onClick={resetForm}
              disabled={saving}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`${styles.btn} ${styles["btn-primary"]}`}
              disabled={saving}
            >
              {saving ? <ButtonLoader /> : editMode ? "تحديث" : "إضافة"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default memo(ServiceForm);
