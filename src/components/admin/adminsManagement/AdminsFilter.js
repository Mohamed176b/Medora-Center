import React from "react";
import styles from "../../../style/AdminsManagement.module.css";

const AdminsFilter = ({
  filters,
  handleFilterChange,
  resetFilters,
  showFilters,
}) => {
  return (
    <div
      className={`${styles.filterSection} ${
        showFilters ? styles.visible : styles.hidden
      }`}
    >
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الدور</label>
          <select
            className={styles.filterSelect}
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
          >
            <option value="">جميع الأدوار</option>
            <option value="super-admin">مسؤول عام</option>
            <option value="admin">مسؤول</option>
            <option value="editor">محرر</option>
            <option value="moderator">مشرف</option>
            <option value="viewer">مشاهد</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>الحالة</label>
          <select
            className={styles.filterSelect}
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
          </select>
        </div>

        <div className={styles.searchBox}>
          <label className={styles.filterLabel}>البحث</label>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            name="searchQuery"
            value={filters.searchQuery}
            onChange={handleFilterChange}
          />
          <i className={`fas fa-search ${styles.searchIcon}`}></i>
        </div>
        <div className={styles.filterActions}>
          <button
            className={`${styles.filterButton} ${styles.resetButton}`}
            onClick={resetFilters}
            disabled={
              !filters.role && !filters.isActive && !filters.searchQuery
            }
          >
            إعادة ضبط
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminsFilter;
