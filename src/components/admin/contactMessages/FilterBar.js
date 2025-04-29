import React, { memo } from "react";
import styles from "../../../style/ContactMessages.module.css";

const FilterBar = memo(
  ({
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterUserType,
    setFilterUserType,
  }) => {
    return (
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="البحث في الرسائل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">جميع الرسائل</option>
          <option value="read">الرسائل المقروءة</option>
          <option value="unread">الرسائل غير المقروءة</option>
        </select>
        <select
          value={filterUserType}
          onChange={(e) => setFilterUserType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">جميع المستخدمين</option>
          <option value="registered">مستخدمين مسجلين</option>
          <option value="guests">زوار</option>
        </select>
      </div>
    );
  }
);

FilterBar.displayName = "FilterBar";

export default FilterBar;
