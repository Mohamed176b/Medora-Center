import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import useAuthorization from "../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../config/roles";
import Loader from "../common/Loader";
import { 
  fetchAllAdminsData,
  fetchAllAppointmentsData,
  fetchAllUsersData,
  fetchAllDoctorsData,
  fetchAllServicesData,
  fetchAllMessagesData,
  fetchAllTestimonialsData,
  fetchSiteSettings,
  fetchAllBlogPosts
} from "../../redux/slices/adminSlice";
import "../../style/AdminHome.css";

import AdminHomeStats from "./AdminHomeStats";

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
    allBlogPosts
  } = useSelector((state) => state.admin);
  const currentRole = admin?.admin?.role || admin?.admin?.admin?.role;

  useEffect(() => {
    // دائماً اجلب بيانات الأدمن نفسه
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

 

  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.dashboard,
    "/"
  );

  if (!isAuthorized) return unauthorizedUI;
  if (loading) return <Loader />;

  // --- Helper Functions ---
  const getRoleBadge = (role) => {
    let color = '#d40d37';
    let label = '';
    switch(role) {
      case 'super-admin': color = '#d40d37'; label = 'مسؤول عام'; break;
      case 'admin': color = '#4CAF50'; label = 'مسؤول'; break;
      case 'editor': color = '#ff9800'; label = 'محرر'; break;
      case 'moderator': color = '#3e8d40'; label = 'مشرف'; break;
      case 'viewer': color = '#607d8b'; label = 'مشاهد'; break;
      default: label = role;
    }
    return <span style={{background: color, color: '#fff', borderRadius: 8, padding: '2px 12px', fontWeight: 700, fontSize: 14, marginRight: 8}}>{label}</span>;
  };

  // --- Sections Data ---

  // المستخدمون
  const sortedUsers = [...allUsersData].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const latestUsers = sortedUsers.slice(0, 2);
  // الحجوزات قيد الانتظار
  const pendingAppointments = allAppointmentsData.filter(a => a.status === 'pending').sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 2);
  // الأطباء النشطون وغير النشطين
  const activeDoctors = allDoctorsData.filter(d => d.is_active).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 2);
  const inactiveDoctors = allDoctorsData.filter(d => !d.is_active).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 2);
  // الخدمات النشطة وغير النشطة
  const activeServices = allServicesData.filter(s => s.is_active).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 2);
  const inactiveServices = allServicesData.filter(s => !s.is_active).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 2);
  // الرسائل غير المقروءة
  const unreadMessages = allMessagesData.filter(m => !m.is_read).sort((a, b) => new Date(b.sent_at || 0) - new Date(a.sent_at || 0)).slice(0, 4);
  // التقييمات غير المراجعة
  const unreviewedTestimonials = allTestimonialsData.filter(t => !t.is_reviewed).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 4);
  // مقالات المدونة المسودة
  const draftPosts = allBlogPosts.filter(p => !p.is_published || p.status === 'draft').sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 2);


  // --- Render ---
  return (
    <div className="admin-dashboard admin-home-custom">
      <div className="admin-welcome">
        <h2>
          مرحبًا، {admin?.admin?.full_name || admin?.admin?.email || 'مسؤول'}
          {getRoleBadge(admin?.admin?.role)}
        </h2>
      </div>

      {/* لمحات من التحليلات */}
      {(PAGE_ROLES.analytics.includes(currentRole) || PAGE_ROLES.appointments.includes(currentRole) || PAGE_ROLES.usersManagement.includes(currentRole)) && (
        <AdminHomeStats />
      )}

      {/* المستخدمون */}
      {PAGE_ROLES.usersManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-users"></i> أحدث المستخدمين</h3>
        <div className="admin-section-list">
          {latestUsers.map(user => (
            <div className="admin-user-card" key={user.id}>
              <div><b>{user.full_name}</b> <span style={{color:'#888'}}>{user.email}</span></div>
              <div style={{fontSize:13, marginTop:4}}>
                رسائل: {user.messages && user.messages[0]?.count || 0} | حجوزات: {user.appointments && user.appointments[0]?.count || 0} | تقييمات: {user.testimonials && user.testimonials[0]?.count || 0}
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* الحجوزات قيد الانتظار */}
      {PAGE_ROLES.appointments.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-calendar-clock"></i> أحدث الحجوزات قيد الانتظار</h3>
        <div className="admin-section-list">
          {pendingAppointments.map(app => (
            <div className="admin-appointment-card" key={app.id}>
              <div>المريض: {app.patients?.full_name || '---'}</div>
              <div>الطبيب: {app.doctors?.full_name || '---'}</div>
              <div>الخدمة: {app.services?.title || '---'}</div>
              <div>تاريخ الحجز: {app.created_at?.slice(0,10) || '--'}</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* الأطباء النشطون */}
      {PAGE_ROLES.doctorsManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-user-md"></i> أطباء نشطون (الأحدث)</h3>
        <div className="admin-section-list">
          {activeDoctors.map(doc => (
            <div className="admin-doctor-card" key={doc.id}>
              <div>{doc.full_name}</div>
              <div style={{fontSize:13, color:'#4CAF50'}}>نشط</div>
            </div>
          ))}
        </div>
      </section>
      )}
      {/* الأطباء غير النشطين */}
      {PAGE_ROLES.doctorsManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-user-md"></i> أطباء غير نشطين (الأحدث)</h3>
        <div className="admin-section-list">
          {inactiveDoctors.map(doc => (
            <div className="admin-doctor-card inactive" key={doc.id}>
              <div>{doc.full_name}</div>
              <div style={{fontSize:13, color:'#d40d37'}}>غير نشط</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* الخدمات النشطة */}
      {PAGE_ROLES.servicesManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-stethoscope"></i> الخدمات النشطة (الأحدث)</h3>
        <div className="admin-section-list">
          {activeServices.map(service => (
            <div className="admin-service-card" key={service.id}>
              <div>{service.title}</div>
              <div style={{fontSize:13, color:'#4CAF50'}}>نشطة</div>
            </div>
          ))}
        </div>
      </section>
      )}
      {/* الخدمات غير النشطة */}
      {PAGE_ROLES.servicesManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-stethoscope"></i> الخدمات غير النشطة (الأحدث)</h3>
        <div className="admin-section-list">
          {inactiveServices.map(service => (
            <div className="admin-service-card inactive" key={service.id}>
              <div>{service.title}</div>
              <div style={{fontSize:13, color:'#d40d37'}}>غير نشطة</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* الرسائل غير المقروءة */}
      {PAGE_ROLES.contactMessages.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-envelope"></i> أحدث الرسائل غير المقروءة</h3>
        <div className="admin-section-list">
          {unreadMessages.map(msg => (
            <div className="admin-message-card" key={msg.id}>
              <div><b>{msg.patients?.full_name || 'مستخدم'}</b> <span style={{color:'#888'}}>{msg.patients?.email || ''}</span></div>
              <div>الموضوع: {msg.subject || 'بدون عنوان'}</div>
              <div style={{fontSize:13}}>بتاريخ: {msg.sent_at?.slice(0,10) || '--'}</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* المراجعات غير المراجعة */}
      {PAGE_ROLES.testimonials.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-solid fa-star-half-alt"></i> أحدث المراجعات غير المراجعة</h3>
        <div className="admin-section-list">
          {unreviewedTestimonials.map(t => (
            <div className="admin-review-card" key={t.id}>
              <div><b>{t.patients?.full_name || 'مستخدم'}</b></div>
              <div>التقييم: {t.rating || '--'} نجوم</div>
              <div style={{fontSize:13}}>بتاريخ: {t.created_at?.slice(0,10) || '--'}</div>
              <div>النص: {t.content?.slice(0,40) || ''}</div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* المدونة: مقالات المسودة */}
      {PAGE_ROLES.blogManagement.includes(currentRole) && (
      <section className="admin-section">
        <h3><i className="fa-brands fa-blogger-b"></i> أحدث مقالات المسودة</h3>
        <div className="admin-section-list">
          {draftPosts.map(post => (
            <div className="admin-blog-card" key={post.id}>
              <div><b>{post.title}</b></div>
              <div style={{fontSize:13}}>بتاريخ: {post.created_at?.slice(0,10) || '--'}</div>
              <div>الكاتب: {post.author?.full_name || '--'}</div>
            </div>
          ))}
        </div>
      </section>
      )}

     
    </div>
  );
};

export default AdminHome;
