import React, { memo } from "react";
import styles from "../../../style/AdminsManagement.module.css";

const AdminCards = memo(
  ({
    admins,
    getRoleBadgeClass,
    getStatusBadgeClass,
    getRoleTranslation,
    openEditModal,
    handleDelete,
    canEdit,
    isViewer,
  }) => {
    if (admins.length === 0) {
      return (
        <div className={styles.noResults}>
          <p>لا توجد نتائج مطابقة للبحث</p>
        </div>
      );
    }

    return (
      <div>
        {admins.map((admin) => (
          <div key={admin.id} className={styles.adminCard}>
            <div className={styles.adminCardRow}>
              <span className={styles.adminCardLabel}>الاسم الكامل:</span>
              <span className={styles.adminCardValue}>{admin.full_name}</span>
            </div>
            <div className={styles.adminCardRow}>
              <span className={styles.adminCardLabel}>البريد الإلكتروني:</span>
              <span className={styles.adminCardValue}>{admin.email}</span>
            </div>
            <div className={styles.adminCardRow}>
              <span className={styles.adminCardLabel}>الدور:</span>
              <span className={styles.adminCardValue}>
                <span
                  className={`${styles.badge} ${getRoleBadgeClass(admin.role)}`}
                >
                  {getRoleTranslation(admin.role)}
                </span>
              </span>
            </div>
            <div className={styles.adminCardRow}>
              <span className={styles.adminCardLabel}>الحالة:</span>
              <span className={styles.adminCardValue}>
                <span
                  className={`${styles.badge} ${getStatusBadgeClass(
                    admin.is_active
                  )}`}
                >
                  {admin.is_active ? "نشط" : "غير نشط"}
                </span>
              </span>
            </div>
            <div className={styles.adminCardRow}>
              <span className={styles.adminCardLabel}>تاريخ الإنشاء:</span>
              <span className={styles.adminCardValue}>
                {new Date(admin.created_at).toLocaleDateString("ar-EG")}
              </span>
            </div>

            <div className={styles.adminCardActions}>
              {canEdit && (
                <>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(admin)}
                  >
                    <i className="fas fa-edit"></i> تعديل
                  </button>
                  {admin.role !== "super-admin" && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(admin.id)}
                    >
                      <i className="fas fa-trash"></i> حذف
                    </button>
                  )}
                </>
              )}
              {isViewer && (
                <>
                  <button
                    className={`${styles.editBtn} ${styles.disabledBtn}`}
                    disabled
                  >
                    <i className="fas fa-edit"></i> تعديل
                  </button>
                  <button
                    className={`${styles.deleteBtn} ${styles.disabledBtn}`}
                    disabled
                  >
                    <i className="fas fa-trash"></i> حذف
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);
AdminCards.displayName = "AdminCards";

export default AdminCards;
