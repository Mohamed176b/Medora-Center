import React from "react";
import useAuthorization from "../../hooks/useAuthorization";
import useAdminState from "../../hooks/useAdminState";
import { PAGE_ROLES } from "../../config/roles";
import Loader from "../common/Loader";
const AdminHome = () => {
  const admin = useAdminState();

  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.dashboard,
    "/"
  );

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  return (
    <div className="admin-dashboard">
      {/* <div className="dashboard-card">
        <h3>
          مرحباً، {admin?.role?.toUpperCase()} {admin?.full_name}
        </h3>
        <p>مرحباً بك في لوحة تحكم المسؤول</p>
      </div>

      <div className="dashboard-card">
        <h3>الإحصائيات</h3>
        <p>إجمالي المستخدمين: --</p>
        <p>إجمالي الحجوزات: --</p>
        <p>الحجوزات النشطة: --</p>
      </div>

      <div className="dashboard-card">
        <h3>الإجراءات السريعة</h3>
        <ul>
          <li>إدارة المستخدمين</li>
          <li>إدارة الحجوزات</li>
          <li>إدارة الأطباء</li>
          <li>إدارة المحتوى</li>
        </ul>
      </div> */}
      <h1>Admin Home</h1>
    </div>
  );
};

export default AdminHome;
