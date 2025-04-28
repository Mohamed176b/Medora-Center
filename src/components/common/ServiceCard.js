import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "../../style/ServiceCard.module.css";
import { useNavigate } from "react-router-dom";
const ServiceCard = ({ service }) => {
  const navigate = useNavigate();
  if (!service) {
    return null;
  }

  // دالة مساعدة لتحويل اسم الأيقونة إلى كائن أيقونة
  const getIconComponent = (iconName) => {
    if (!iconName) return Icons.faClinicMedical; // أيقونة افتراضية

    try {
      // إزالة البادئة "fa" من اسم الأيقونة إذا وجدت
      const cleanIconName = iconName.replace(/^fa/, "");
      // تحويل الاسم إلى الصيغة الصحيحة للمكتبة
      const iconKey = `fa${cleanIconName}`;
      return Icons[iconKey] || Icons.faClinicMedical;
    } catch (error) {
      console.error("Error loading icon:", error);
      return Icons.faClinicMedical;
    }
  };
  const handleServiceClick = () => {
    navigate(`/services/${service.slug}`);
  };
  return (
    <div className={styles.serviceCard}>
      <div className={styles.serviceIcon} onClick={handleServiceClick}>
        <FontAwesomeIcon icon={getIconComponent(service.icon)} />
      </div>
      <h3 className={styles.serviceTitle}  onClick={handleServiceClick}>{service.title || "خدمة طبية"}</h3>
      <p className={styles.serviceDescription}>
        {service.description || "وصف الخدمة غير متوفر"}
      </p>
      <button
        className={styles.bookButton}
        onClick={() => {
          navigate("/booking");
        }}
      >
        احجز موعد
        <i className="fas fa-arrow-left"></i>
      </button>
    </div>
  );
};

export default ServiceCard;
