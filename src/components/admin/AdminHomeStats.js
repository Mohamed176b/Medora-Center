import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../supabase/supabaseClient";
import { useSelector } from "react-redux";
import { PAGE_ROLES } from "../../config/roles";

const AdminHomeStats = React.memo(() => {
  const admin = useSelector((state) => state.admin);
  const currentRole = admin?.admin?.role || admin?.admin?.admin?.role;
  const rawUsersData = useSelector((state) => state.admin.allUsersData);
  const rawAppointmentsData = useSelector(
    (state) => state.admin.allAppointmentsData
  );

  const allUsersData = useMemo(() => rawUsersData || [], [rawUsersData]);
  const allAppointmentsData = useMemo(
    () => rawAppointmentsData || [],
    [rawAppointmentsData]
  );

  const [siteViews, setSiteViews] = useState(0);
  const [blogViews, setBlogViews] = useState(0);

  const activeUsers = useMemo(() => {
    return allUsersData.filter((u) => u.is_active).length;
  }, [allUsersData]);

  const appointmentsCount = useMemo(() => {
    return allAppointmentsData.length;
  }, [allAppointmentsData]);

  useEffect(() => {
    const fetchSiteViews = async () => {
      const { count, error } = await supabase
        .from("site_views")
        .select("*", { count: "exact", head: true });
      if (!error) setSiteViews(count || 0);
    };

    const fetchBlogViews = async () => {
      const { data, error } = await supabase
        .from("blog_post_views")
        .select("id");
      if (!error && data) setBlogViews(data.length);
    };

    fetchSiteViews();
    fetchBlogViews();
  }, []);

  const analyticsCards = useMemo(() => {
    if (!PAGE_ROLES.analytics.includes(currentRole)) return null;
    return (
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
    );
  }, [currentRole, siteViews, blogViews]);

  const appointmentsCard = useMemo(() => {
    if (!PAGE_ROLES.appointments.includes(currentRole)) return null;
    return (
      <div className="admin-stat-card">
        <i className="fa-solid fa-calendar-check"></i>
        <div>عدد الحجوزات</div>
        <div className="admin-stat-value">{appointmentsCount}</div>
      </div>
    );
  }, [currentRole, appointmentsCount]);

  const usersCard = useMemo(() => {
    if (!PAGE_ROLES.usersManagement.includes(currentRole)) return null;
    return (
      <div className="admin-stat-card">
        <i className="fa-solid fa-users"></i>
        <div>المستخدمون النشطون</div>
        <div className="admin-stat-value">{activeUsers}</div>
      </div>
    );
  }, [currentRole, activeUsers]);

  return (
    <section className="admin-section">
      <h3>
        <i className="fa-solid fa-chart-simple"></i> لمحات من التحليلات
      </h3>
      <div className="admin-stats-list">
        {analyticsCards}
        {appointmentsCard}
        {usersCard}
      </div>
    </section>
  );
});

AdminHomeStats.displayName = "AdminHomeStats";

export default AdminHomeStats;
