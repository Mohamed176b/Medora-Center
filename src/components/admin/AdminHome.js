import React, { useEffect, useMemo, useCallback, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAuthorization from "../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../config/roles";
import {
  fetchAllAdminsData,
  fetchAllAppointmentsData,
  fetchAllUsersData,
  fetchAllDoctorsData,
  fetchAllServicesData,
  fetchAllMessagesData,
  fetchAllTestimonialsData,
  fetchSiteSettings,
  fetchAllBlogPosts,
} from "../../redux/slices/adminSlice";
import "../../style/AdminHome.css";
const Loader = React.lazy(() => import("../common/Loader"));
const AdminHomeStats = React.lazy(() => import("./AdminHomeStats"));

const AdminHome = () => {
  const dispatch = useDispatch();
  const {
    loading,
    admin,
    allAppointmentsData,
    allUsersData,
    allDoctorsData,
    allServicesData,
    allMessagesData,
    allTestimonialsData,
    allBlogPosts,
  } = useSelector((state) => state.admin);
  const currentRole = admin?.admin?.role || admin?.admin?.admin?.role;

  useEffect(() => {
    document.title = "لوحة التحكم | مركز ميدورا";
  }, []);

  const fetchData = useCallback(() => {
    dispatch(fetchAllAdminsData());
    if (PAGE_ROLES.usersManagement.includes(currentRole)) {
      dispatch(fetchAllUsersData());
    }
    if (PAGE_ROLES.appointments.includes(currentRole)) {
      dispatch(fetchAllAppointmentsData());
    }
    if (PAGE_ROLES.doctorsManagement.includes(currentRole)) {
      dispatch(fetchAllDoctorsData());
    }
    if (PAGE_ROLES.servicesManagement.includes(currentRole)) {
      dispatch(fetchAllServicesData());
    }
    if (PAGE_ROLES.contactMessages.includes(currentRole)) {
      dispatch(fetchAllMessagesData());
    }
    if (PAGE_ROLES.testimonials.includes(currentRole)) {
      dispatch(fetchAllTestimonialsData());
    }
    if (PAGE_ROLES.siteSettings.includes(currentRole)) {
      dispatch(fetchSiteSettings());
    }
    if (PAGE_ROLES.blogManagement.includes(currentRole)) {
      dispatch(fetchAllBlogPosts());
    }
  }, [dispatch, currentRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.dashboard,
    "/"
  );

  const getRoleBadge = useCallback((role) => {
    let color = "#d40d37";
    let label = "";
    switch (role) {
      case "super-admin":
        color = "#d40d37";
        label = "مسؤول عام";
        break;
      case "admin":
        color = "#4CAF50";
        label = "مسؤول";
        break;
      case "editor":
        color = "#ff9800";
        label = "محرر";
        break;
      case "moderator":
        color = "#3e8d40";
        label = "مشرف";
        break;
      case "viewer":
        color = "#607d8b";
        label = "مشاهد";
        break;
      default:
        label = role;
    }
    return (
      <span
        style={{
          background: color,
          color: "#fff",
          borderRadius: 8,
          padding: "2px 12px",
          fontWeight: 700,
          fontSize: 14,
          marginRight: 8,
        }}
      >
        {label}
      </span>
    );
  }, []);

  const sortedUsers = useMemo(() => {
    return [...allUsersData]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
  }, [allUsersData]);

  const pendingAppointments = useMemo(() => {
    return allAppointmentsData
      .filter((a) => a.status === "pending")
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2);
  }, [allAppointmentsData]);

  const { activeDoctors, inactiveDoctors } = useMemo(() => {
    const active = allDoctorsData
      .filter((d) => d.is_active)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 2);
    const inactive = allDoctorsData
      .filter((d) => !d.is_active)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 2);
    return { activeDoctors: active, inactiveDoctors: inactive };
  }, [allDoctorsData]);

  const { activeServices, inactiveServices } = useMemo(() => {
    const active = allServicesData
      .filter((s) => s.is_active)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 2);
    const inactive = allServicesData
      .filter((s) => !s.is_active)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 2);
    return { activeServices: active, inactiveServices: inactive };
  }, [allServicesData]);

  const unreadMessages = useMemo(() => {
    return allMessagesData
      .filter((m) => !m.is_read)
      .sort((a, b) => new Date(b.sent_at || 0) - new Date(a.sent_at || 0))
      .slice(0, 4);
  }, [allMessagesData]);

  const unreviewedTestimonials = useMemo(() => {
    return allTestimonialsData
      .filter((t) => !t.is_reviewed)
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 4);
  }, [allTestimonialsData]);

  const draftPosts = useMemo(() => {
    return allBlogPosts
      .filter((p) => !p.is_published || p.status === "draft")
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 2);
  }, [allBlogPosts]);

  if (!isAuthorized) return unauthorizedUI;
  if (loading) return <Loader />;

  return (
    <div className="admin-dashboard admin-home-custom">
      <div className="admin-welcome">
        <h2>
          مرحبًا، {admin?.admin?.full_name || admin?.admin?.email || "مسؤول"}
          {getRoleBadge(admin?.admin?.role)}
        </h2>
      </div>

      <Suspense fallback={<Loader />}>
        {(PAGE_ROLES.analytics.includes(currentRole) ||
          PAGE_ROLES.appointments.includes(currentRole) ||
          PAGE_ROLES.usersManagement.includes(currentRole)) && (
          <AdminHomeStats />
        )}
      </Suspense>

      {PAGE_ROLES.usersManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-users"></i> أحدث المستخدمين
          </h3>
          <div className="admin-section-list">
            {sortedUsers.map((user) => (
              <div className="admin-user-card" key={user.id}>
                <div>
                  <b>{user.full_name}</b>
                </div>
                <div style={{ color: "#666" }}>{user.email}</div>
                <div className="user-stats">
                  <span>
                    <i className="fa-solid fa-envelope"></i>{" "}
                    {(user.messages && user.messages[0]?.count) || 0}
                  </span>
                  <span>
                    <i className="fa-solid fa-calendar-check"></i>{" "}
                    {(user.appointments && user.appointments[0]?.count) || 0}
                  </span>
                  <span>
                    <i className="fa-solid fa-star"></i>{" "}
                    {(user.testimonials && user.testimonials[0]?.count) || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.appointments.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-calendar-clock"></i> أحدث الحجوزات قيد
            الانتظار
          </h3>
          <div className="admin-section-list">
            {pendingAppointments.map((app) => (
              <div className="admin-appointment-card" key={app.id}>
                <div>
                  <i className="fa-solid fa-user-circle"></i>{" "}
                  {app.patients?.full_name || "---"}
                </div>
                <div>
                  <i className="fa-solid fa-user-md"></i>{" "}
                  {app.doctors?.full_name || "---"}
                </div>
                <div>
                  <i className="fa-solid fa-stethoscope"></i>{" "}
                  {app.services?.title || "---"}
                </div>
                <div>
                  <i className="fa-solid fa-calendar"></i>{" "}
                  {app.created_at?.slice(0, 10) || "--"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.doctorsManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-user-md"></i> أطباء نشطون (الأحدث)
          </h3>
          <div className="admin-section-list">
            {activeDoctors.map((doc) => (
              <div className="admin-doctor-card" key={doc.id}>
                <div>
                  <i className="fa-solid fa-user-md"></i> {doc.full_name}
                </div>
                <div>
                  <i
                    className="fa-solid fa-check-circle"
                    style={{ color: "#4CAF50" }}
                  ></i>{" "}
                  نشط
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.doctorsManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-user-md"></i> أطباء غير نشطين (الأحدث)
          </h3>
          <div className="admin-section-list">
            {inactiveDoctors.map((doc) => (
              <div className="admin-doctor-card inactive" key={doc.id}>
                <div>
                  <i className="fa-solid fa-user-md"></i> {doc.full_name}
                </div>
                <div>
                  <i
                    className="fa-solid fa-times-circle"
                    style={{ color: "#d40d37" }}
                  ></i>{" "}
                  غير نشط
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.servicesManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-stethoscope"></i> الخدمات النشطة (الأحدث)
          </h3>
          <div className="admin-section-list">
            {activeServices.map((service) => (
              <div className="admin-service-card" key={service.id}>
                <div>
                  <i className="fa-solid fa-heartbeat"></i> {service.title}
                </div>
                <div>
                  <i
                    className="fa-solid fa-check-circle"
                    style={{ color: "#4CAF50" }}
                  ></i>{" "}
                  نشطة
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.servicesManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-stethoscope"></i> الخدمات غير النشطة
            (الأحدث)
          </h3>
          <div className="admin-section-list">
            {inactiveServices.map((service) => (
              <div className="admin-service-card inactive" key={service.id}>
                <div>
                  <i className="fa-solid fa-heartbeat"></i> {service.title}
                </div>
                <div>
                  <i
                    className="fa-solid fa-times-circle"
                    style={{ color: "#d40d37" }}
                  ></i>{" "}
                  غير نشطة
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.contactMessages.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-envelope"></i> أحدث الرسائل غير المقروءة
          </h3>
          <div className="admin-section-list">
            {unreadMessages.map((msg) => (
              <div className="admin-message-card" key={msg.id}>
                <div>
                  <i className="fa-solid fa-user"></i>{" "}
                  <b>
                    {msg.guest_name ||
                      allUsersData.filter(
                        (user) => user.id === msg.patient_id
                      )[0]?.full_name ||
                      "مستخدم"}
                  </b>
                </div>
                <div>
                  <i className="fa-solid fa-envelope"></i>{" "}
                  {msg.guest_email ||
                    allUsersData.filter((user) => user.id === msg.patient_id)[0]
                      ?.email ||
                    ""}
                </div>
                <div>
                  <i className="fa-solid fa-comment"></i>{" "}
                  {msg.subject || "بدون عنوان"}
                </div>
                <div>
                  <i className="fa-solid fa-clock"></i>{" "}
                  {msg.sent_at?.slice(0, 10) || "--"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.testimonials.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-solid fa-star-half-alt"></i> أحدث المراجعات غير
            المراجعة
          </h3>
          <div className="admin-section-list">
            {unreviewedTestimonials.map((t) => (
              <div className="admin-review-card" key={t.id}>
                <div>
                  <i className="fa-solid fa-user"></i>{" "}
                  <b>{t.patients?.full_name || "مستخدم"}</b>
                </div>
                <div>
                  <i
                    className="fa-solid fa-star"
                    style={{ color: "#ffc107" }}
                  ></i>
                  {t.rating || "--"} نجوم
                </div>
                <div>
                  <i className="fa-solid fa-clock"></i>{" "}
                  {t.created_at?.slice(0, 10) || "--"}
                </div>
                <div>
                  <i className="fa-solid fa-comment"></i>{" "}
                  {t.content?.slice(0, 40) || ""}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {PAGE_ROLES.blogManagement.includes(currentRole) && (
        <section className="admin-section">
          <h3>
            <i className="fa-brands fa-blogger-b"></i> أحدث مقالات المسودة
          </h3>
          <div className="admin-section-list">
            {draftPosts.map((post) => (
              <div className="admin-blog-card" key={post.id}>
                <div>
                  <i className="fa-solid fa-file-alt"></i> <b>{post.title}</b>
                </div>
                <div>
                  <i className="fa-solid fa-clock"></i>{" "}
                  {post.created_at?.slice(0, 10) || "--"}
                </div>
                <div>
                  <i className="fa-solid fa-user-edit"></i>{" "}
                  {post.author?.full_name || "--"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

AdminHome.displayName = "AdminHome";

export default React.memo(AdminHome);
