import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../../style/ServicesManagement.module.css";

const IconSelector = ({
  availableIcons,
  selectedIcon,
  onIconSelect,
  iconSearch,
  setIconSearch,
  canEdit,
}) => {
  // تصفية الأيقونات حسب البحث
  const filteredIcons = iconSearch
    ? availableIcons.filter(
        (icon) =>
          icon.name.includes(iconSearch) ||
          icon.value.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : availableIcons;

  return (
    <div className={styles["form-group"]}>
      <label htmlFor="icon-search">أيقونة الخدمة</label>
      <input
        type="text"
        id="icon-search"
        placeholder="ابحث عن أيقونة..."
        value={iconSearch}
        onChange={(e) => setIconSearch(e.target.value)}
        disabled={!canEdit}
        className={styles["icon-search"]}
      />

      <div className={styles["icons-grid"]}>
        {filteredIcons.map((icon) => (
          <div
            key={icon.value}
            className={`${styles["icon-item"]} ${
              selectedIcon === icon.value ? styles["selected"] : ""
            }`}
            onClick={() => canEdit && onIconSelect(icon.value)}
            title={icon.name}
          >
            <FontAwesomeIcon icon={icon.icon} />
            <span className={styles["icon-name"]}>{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IconSelector;
