import React, { memo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../../common/Loader";
import availableIcons from "./serviceIcons";
import styles from "../../../style/ServicesManagement.module.css";

const ServicesList = memo(
  ({
    services,
    loading,
    canEdit,
    handleEditService,
    handleDeleteService,
    moveServiceUp,
    moveServiceDown,
  }) => {
    const renderIcon = useCallback((iconName) => {
      const iconObj = availableIcons.find((icon) => icon.value === iconName);
      if (iconObj) {
        return <FontAwesomeIcon icon={iconObj.icon} />;
      }
      return <span className={styles["no-icon"]}>-</span>;
    }, []);

    if (loading) {
      return (
        <div className={styles["services-loader-wrapper"]}>
          <Loader />
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className={styles.noResults}>
          <i className="fas fa-search"></i>
          <p>لا توجد خدمات مطابقة لمعايير البحث</p>
        </div>
      );
    }

    return (
      <div className={styles["table-responsive"]}>
        <table className={styles["services-table"]}>
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>العنوان</th>
              <th>الوصف</th>
              <th>الحالة</th>
              {canEdit && <th>الإجراءات</th>}
              {canEdit && <th>الترتيب</th>}
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                className={!service.is_active ? styles["inactive-service"] : ""}
              >
                <td className={styles["icon-cell"]} data-label="الأيقونة">
                  {renderIcon(service.icon)}
                </td>
                <td data-label="العنوان">{service.title}</td>
                <td className={styles["description-cell"]} data-label="الوصف">
                  {service.description.length > 100
                    ? `${service.description.substring(0, 100)}...`
                    : service.description}
                </td>
                <td data-label="الحالة">
                  <span
                    className={`${styles["status-badge"]} ${
                      service.is_active ? styles["active"] : styles["inactive"]
                    }`}
                  >
                    {service.is_active ? "نشط" : "غير نشط"}
                  </span>
                </td>
                {canEdit && (
                  <td className={styles["actions-cell"]} data-label="الإجراءات">
                    <button
                      className={styles["edit-button"]}
                      onClick={() => handleEditService(service)}
                    >
                      تعديل
                    </button>
                    <button
                      className={styles["delete-button"]}
                      onClick={() => handleDeleteService(service.id)}
                    >
                      حذف
                    </button>
                  </td>
                )}
                {canEdit && (
                  <td
                    className={styles["order-actions-cell"]}
                    data-label="الترتيب"
                  >
                    <div className={styles["order-buttons-container"]}>
                      <button
                        className={`${styles["order-button"]} ${styles["order-up"]}`}
                        onClick={() => moveServiceUp(service)}
                        title="تحريك لأعلى"
                        disabled={loading}
                        aria-label="تحريك لأعلى"
                      >
                        &#9650;
                      </button>
                      <button
                        className={`${styles["order-button"]} ${styles["order-down"]}`}
                        onClick={() => moveServiceDown(service)}
                        title="تحريك لأسفل"
                        disabled={loading}
                        aria-label="تحريك لأسفل"
                      >
                        &#9660;
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default ServicesList;
