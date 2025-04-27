import React from "react";
import styles from "../../../style/AdminsManagement.module.css";

const AdminsTable = ({
  admins,
  getRoleBadgeClass,
  getStatusBadgeClass,
  getRoleTranslation,
  openEditModal,
  handleDelete,
  canEdit,
  isViewer,
}) => {
  return (
    <table className={styles.adminsTable}>
      <thead>
        <tr>
          <th>الاسم الكامل</th>
          <th>البريد الإلكتروني</th>
          <th>الدور</th>
          <th>الحالة</th>
          <th>تاريخ الإنشاء</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin) => (
          <tr key={admin.id}>
            <td>{admin.full_name}</td>
            <td>{admin.email}</td>
            <td>
              <span
                className={`${styles.badge} ${getRoleBadgeClass(admin.role)}`}
              >
                {getRoleTranslation(admin.role)}
              </span>
            </td>
            <td>
              <span
                className={`${styles.badge} ${getStatusBadgeClass(
                  admin.is_active
                )}`}
              >
                {admin.is_active ? "نشط" : "غير نشط"}
              </span>
            </td>
            <td>{new Date(admin.created_at).toLocaleDateString("ar-EG")}</td>
            <td className={styles.actions}>
              {canEdit && (
                <>
                  <button
                    className={styles.editBtn}
                    onClick={() => openEditModal(admin)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  {admin.role !== "super-admin" && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(admin.id)}
                    >
                      <i className="fas fa-trash"></i>
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
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className={`${styles.deleteBtn} ${styles.disabledBtn}`}
                    disabled
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminsTable;
