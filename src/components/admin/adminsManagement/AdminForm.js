import React, { memo } from "react";
import styles from "../../../style/AdminsManagement.module.css";

const AdminForm = memo(
  ({
    editMode,
    formData,
    handleInputChange,
    handleSubmit,
    closeModal,
    submitting,
    error,
    currentAdmin,
  }) => {
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <h2>{editMode ? "تعديل مسؤول" : "إضافة مسؤول"}</h2>
            <button className={styles.closeBtn} onClick={closeModal}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="full_name">الاسم الكامل</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">البريد الإلكتروني</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={editMode}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="role">الدور</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                disabled={editMode && currentAdmin?.role === "super-admin"}
              >
                <option value="super-admin">مسؤول عام</option>
                <option value="admin">مسؤول</option>
                <option value="editor">محرر</option>
                <option value="moderator">مشرف</option>
                <option value="viewer">مشاهد</option>
              </select>
              {editMode && currentAdmin?.role === "super-admin" && (
                <small className={styles.helpText}>
                  لا يمكن تغيير دور المسؤول العام
                </small>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                نشط
              </label>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting}
              >
                {submitting
                  ? "جاري المعالجة..."
                  : editMode
                  ? "حفظ التغييرات"
                  : "إضافة"}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeModal}
                disabled={submitting}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
);

export default AdminForm;
