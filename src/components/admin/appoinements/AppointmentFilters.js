import React, { memo } from "react";

const AppointmentFilters = memo(
  ({ searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => {
    return (
      <>
        <div className="admin-actions">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="البحث عن مريض، طبيب، أو خدمة..."
              value={searchTerm}
              onChange={onSearchChange}
            />
          </div>

          <div className="filter-container">
            <i className="fas fa-filter filter-icon"></i>
            <select value={statusFilter} onChange={onStatusFilterChange}>
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="confirmed">مؤكد</option>
              <option value="cancelled">ملغي</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>
        </div>
      </>
    );
  }
);

export default AppointmentFilters;
