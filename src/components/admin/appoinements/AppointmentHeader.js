import React, { memo } from "react";

const AppointmentHeader = memo(({ totalCount, filteredCount }) => {
  return (
    <>
      <div className="admin-header">
        <h1>إدارة المواعيد</h1>
        <p>إدارة وتنظيم مواعيد المرضى، تعيين الأطباء، وتحديث الحالة</p>
      </div>

      <div className="appointments-counter">
        {filteredCount > 0
          ? `عرض ${filteredCount} من أصل ${totalCount} موعد`
          : "لا توجد مواعيد مطابقة"}
      </div>
    </>
  );
});

export default AppointmentHeader;
