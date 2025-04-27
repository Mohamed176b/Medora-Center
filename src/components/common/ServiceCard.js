import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import styles from "../../style/ServiceCard.module.css";

const ServiceCard = ({ service, onClick }) => {
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

  return (
    <div className={styles.serviceCard} onClick={onClick}>
      <div className={styles.serviceIcon}>
        <FontAwesomeIcon icon={getIconComponent(service.icon)} />
      </div>
      <h3 className={styles.serviceTitle}>{service.title || "خدمة طبية"}</h3>
      <p className={styles.serviceDescription}>
        {service.description || "وصف الخدمة غير متوفر"}
      </p>
      <button className={styles.bookButton}>
        احجز موعد
        <i className="fas fa-arrow-left"></i>
      </button>
    </div>
  );
};

export default ServiceCard;
