import React, { memo, useCallback, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../../../style/ServicesManagement.module.css";

const IconSelector = memo(
  ({
    availableIcons,
    selectedIcon,
    onIconSelect,
    iconSearch,
    setIconSearch,
    canEdit,
  }) => {
    const filteredIcons = useMemo(
      () =>
        iconSearch
          ? availableIcons.filter(
              (icon) =>
                icon.name.includes(iconSearch) ||
                icon.value.toLowerCase().includes(iconSearch.toLowerCase())
            )
          : availableIcons,
      [iconSearch, availableIcons]
    );

    const handleSearchChange = useCallback(
      (e) => {
        setIconSearch(e.target.value);
      },
      [setIconSearch]
    );

    return (
      <div className={styles["form-group"]}>
        <label htmlFor="icon-search">أيقونة الخدمة</label>
        <input
          type="text"
          id="icon-search"
          placeholder="ابحث عن أيقونة..."
          value={iconSearch}
          onChange={handleSearchChange}
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
  }
);

export default IconSelector;
