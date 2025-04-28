import React from "react";
import styles from "../../style/Doctors.module.css";
import { useNavigate } from "react-router-dom";
const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate(); 
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
        <div>
        {doctor.doctor_services?.length > 0 ? (
          doctor.doctor_services.map((serviceObj, idx) => {
            const service = serviceObj.services || serviceObj;
            if (!service) return null;
            return (
              <span
                className={styles["doctor-service"]}
                key={service.id || idx}
                onClick={() => navigate("/services/" + service.slug)}
              >
                {service.title}
              </span>
            );
          })
        ) : (
          <span className={styles["doctor-service"]}>لا توجد خدمات</span>
        )}
        </div>
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
