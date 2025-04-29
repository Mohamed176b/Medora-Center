import React, { memo } from "react";
import styles from "../../../style/AdminsManagement.module.css";

const AdminsHeader = memo(
  ({ canEdit, isViewer, openAddModal, toggleFilters }) => {
    return (
      <div className={styles.header}>
        <h1>إدارة المسؤولين</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.filterToggleBtn}
            onClick={toggleFilters}
            aria-label="عرض/إخفاء خيارات البحث والفلترة"
          >
            <i className="fas fa-filter"></i>
            <span>البحث والفلترة</span>
          </button>

          {canEdit && (
            <button className={styles.addBtn} onClick={openAddModal}>
              <i className="fas fa-user-plus"></i> إضافة مسؤول
            </button>
          )}
          {isViewer && (
            <button
              className={`${styles.addBtn} ${styles.disabledBtn}`}
              disabled
            >
              <i className="fas fa-user-plus"></i> إضافة مسؤول
            </button>
          )}
        </div>
      </div>
    );
  }
);
AdminsHeader.displayName = "AdminsHeader";

export default AdminsHeader;
