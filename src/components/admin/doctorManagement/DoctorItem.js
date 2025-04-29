import React, { memo } from "react";
import styles from "../../../style/DoctorManagement.module.css";

const DoctorItem = memo(({ doctor, canEdit, onEdit, onDelete, isDeleting }) => {
  return (
    <tr className={!doctor.is_active ? styles["inactive-doctor"] : ""}>
      <td className={styles["doctor-image-cell"]} data-label="الصورة">
        {doctor.image_url ? (
          <img
            src={doctor.image_url}
            alt={doctor.full_name}
            className={styles["doctor-thumbnail"]}
            loading="lazy"
          />
        ) : (
          <div className={styles["no-image"]}>لا توجد صورة</div>
        )}
      </td>
      <td data-label="الاسم">{doctor.full_name}</td>
      <td data-label="البريد الإلكتروني">{doctor.email}</td>
      <td data-label="رقم الهاتف">{doctor.phone || "-"}</td>
      <td data-label="الخدمات">
        {doctor.doctor_services?.length > 0
          ? doctor.doctor_services.map((ds) => ds.services?.title).join(", ")
          : "لم يتم تحديد خدمات"}
      </td>
      <td data-label="الحالة">
        <span
          className={`${styles["status-badge"]} ${
            doctor.is_active ? styles["active"] : styles["inactive"]
          }`}
        >
          {doctor.is_active ? "نشط" : "غير نشط"}
        </span>
      </td>
      {canEdit && (
        <td className={styles["actions-cell"]} data-label="الإجراءات">
          <button
            className={styles["edit-button"]}
            onClick={() => onEdit(doctor)}
            disabled={isDeleting}
          >
            تعديل
          </button>
          <button
            className={styles["delete-button"]}
            onClick={() => onDelete(doctor.id)}
            disabled={isDeleting}
          >
            حذف
          </button>
        </td>
      )}
    </tr>
  );
});

DoctorItem.displayName = "DoctorItem";

export default DoctorItem;
