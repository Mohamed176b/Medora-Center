import React from "react";
import styles from "../../../style/DoctorManagement.module.css";

const DoctorCard = ({ doctor, canEdit, onEdit, onDelete, isDeleting }) => {
  return (
    <div
      className={`${styles.doctorCard} ${
        !doctor.is_active ? styles.inactiveCard : ""
      }`}
    >
      <div className={styles.doctorCardHeader}>
        <div className={styles.doctorImageContainer}>
          {doctor.image_url ? (
            <img
              src={doctor.image_url}
              alt={doctor.full_name}
              className={styles.doctorCardImage}
            />
          ) : (
            <div className={styles.doctorCardNoImage}>
              <i className="fas fa-user-md"></i>
            </div>
          )}
        </div>
        <div className={styles.doctorCardInfo}>
          <h3 className={styles.doctorCardName}>{doctor.full_name}</h3>
          <span
            className={`${styles.statusBadge} ${
              doctor.is_active ? styles.active : styles.inactive
            }`}
          >
            {doctor.is_active ? "نشط" : "غير نشط"}
          </span>
        </div>
      </div>

      <div className={styles.doctorCardDetails}>
        <div className={styles.doctorCardRow}>
          <span className={styles.doctorCardLabel}>البريد الإلكتروني:</span>
          <span className={styles.doctorCardValue}>{doctor.email}</span>
        </div>

        <div className={styles.doctorCardRow}>
          <span className={styles.doctorCardLabel}>رقم الهاتف:</span>
          <span className={styles.doctorCardValue}>{doctor.phone || "-"}</span>
        </div>

        <div className={styles.doctorCardRow}>
          <span className={styles.doctorCardLabel}>الخدمات:</span>
          <span className={styles.doctorCardValue}>
            {doctor.doctor_services?.length > 0
              ? doctor.doctor_services
                  .map((ds) => ds.services?.title)
                  .join(", ")
              : "لم يتم تحديد خدمات"}
          </span>
        </div>
      </div>

      {canEdit && (
        <div className={styles.doctorCardActions}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(doctor)}
            disabled={isDeleting}
          >
            <i className="fas fa-edit"></i> تعديل
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(doctor.id)}
            disabled={isDeleting}
          >
            <i className="fas fa-trash"></i> حذف
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorCard;
