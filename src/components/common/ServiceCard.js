import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "../../style/ServiceCard.module.css";
import { useNavigate } from "react-router-dom";
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const getIconComponent = React.useCallback((iconName) => {
    if (!iconName) return Icons.faClinicMedical;
    try {
      const cleanIconName = iconName.replace(/^fa/, "");
      const iconKey = `fa${cleanIconName}`;
      return Icons[iconKey] || Icons.faClinicMedical;
    } catch (error) {
      return Icons.faClinicMedical;
    }
  }, []);

  const handleServiceClick = React.useCallback(() => {
    if (service && service.slug) {
      navigate(`/services/${service.slug}`);
    }
  }, [navigate, service?.slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookClick = React.useCallback(() => {
    navigate("/booking");
  }, [navigate]);

  if (!service) {
    return null;
  }

  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceIcon} onClick={handleServiceClick}>
        <FontAwesomeIcon icon={getIconComponent(service.icon)} />
      </div>
      <h3 className={styles.serviceTitle} onClick={handleServiceClick}>{service.title || "خدمة طبية"}</h3>
      <p className={styles.serviceDescription}>
        {service.description || "وصف الخدمة غير متوفر"}
      </p>
      <button
        className={styles.bookButton}
        onClick={handleBookClick}
      >
        احجز موعد
        <i className="fas fa-arrow-left"></i>
      </button>
    </div>
  );
};

export default React.memo(ServiceCard);
