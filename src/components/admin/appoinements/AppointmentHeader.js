import React from "react";

const AppointmentHeader = ({ totalCount, filteredCount }) => {
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

      {filteredCount === 0 && (
        <div className="no-appointments">
          <h3>لا توجد مواعيد متاحة</h3>
          <p>لم يتم العثور على مواعيد تطابق معايير البحث الحالية</p>
        </div>
      )}
    </>
  );
};

export default AppointmentHeader;
