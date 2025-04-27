import React, { useEffect, useState } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useSelector } from "react-redux";
import { PAGE_ROLES } from "../../config/roles";

const AdminHomeStats = () => {
  const allUsersData = useSelector((state) => state.admin.allUsersData) || [];
  const allAppointmentsData = useSelector((state) => state.admin.allAppointmentsData) || [];
  const admin = useSelector((state) => state.admin);
  const currentRole = admin?.admin?.role || admin?.admin?.admin?.role;
  const [siteViews, setSiteViews] = useState(0);
  const [blogViews, setBlogViews] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // جلب عدد مشاهدات الموقع
    const fetchSiteViews = async () => {
      const { count, error } = await supabase
        .from("site_views")
        .select("*", { count: "exact", head: true });
      if (!error) setSiteViews(count || 0);
    };
    // جلب عدد مشاهدات المقالات
    const fetchBlogViews = async () => {
      const { data, error } = await supabase
        .from("blog_post_views")
        .select("id");
      if (!error && data) setBlogViews(data.length);
    };
    fetchSiteViews();
    fetchBlogViews();
  }, []);

  useEffect(() => {
    // المستخدمون النشطون
    setActiveUsers(allUsersData.filter((u) => u.is_active).length);
  }, [allUsersData]);

  return (
    <section className="admin-section">
      <h3><i className="fa-solid fa-chart-simple"></i> لمحات من التحليلات</h3>
      <div className="admin-stats-list">
        {PAGE_ROLES.analytics.includes(currentRole) && (
          <>
            <div className="admin-stat-card">
              <i className="fa-solid fa-eye"></i>
              <div>مشاهدات الموقع</div>
              <div className="admin-stat-value">{siteViews}</div>
            </div>
            <div className="admin-stat-card">
              <i className="fa-solid fa-eye"></i>
              <div>مشاهدات المقالات</div>
              <div className="admin-stat-value">{blogViews}</div>
            </div>
          </>
        )}
        {PAGE_ROLES.appointments.includes(currentRole) &&  (
          <div className="admin-stat-card">
            <i className="fa-solid fa-calendar-check"></i>
            <div>عدد الحجوزات</div>
            <div className="admin-stat-value">{allAppointmentsData.length}</div>
          </div>
        )}
        {PAGE_ROLES.usersManagement.includes(currentRole) && (
          <div className="admin-stat-card">
            <i className="fa-solid fa-users"></i>
            <div>المستخدمون النشطون</div>
            <div className="admin-stat-value">{activeUsers}</div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminHomeStats;
