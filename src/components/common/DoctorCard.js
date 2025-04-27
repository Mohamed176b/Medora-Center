import React from "react";
import styles from "../../style/Doctors.module.css";

const DoctorCard = ({ doctor }) => {
  return (
    <div className={styles["doctor-card"]}>
      <div className={styles["doctor-image-container"]}>
        {doctor.image_url ? (
          <img
            src={doctor.image_url}
            alt={doctor.full_name}
            className={styles["doctor-image"]}
          />
        ) : (
          <div className={styles["doctor-no-image"]}>
            <span>{doctor.full_name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className={styles["doctor-info"]}>
        <h3 className={styles["doctor-name"]}>{doctor.full_name}</h3>
        <p className={styles["doctor-specialization"]}>
          {doctor.specialization || "طبيب"}
        </p>
        {doctor.bio && <p className={styles["doctor-bio"]}>{doctor.bio}</p>}
        <div className={styles["doctor-contact"]}>
          {doctor.email && (
            <p className={styles["doctor-email"]}>
              <span>البريد الإلكتروني:</span> {doctor.email}
            </p>
          )}
          {doctor.phone && (
            <p className={styles["doctor-phone"]}>
              <span>الهاتف:</span> {doctor.phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
