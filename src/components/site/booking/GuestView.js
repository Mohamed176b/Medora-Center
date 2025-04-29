import React from "react";
import useAdminState from "../../../hooks/useAdminState";

const GuestView = React.memo(({ onLogin, onRegister }) => {
  const admin = useAdminState();
  const isAdmin =
    admin?.role === "super-admin" ||
    admin?.role === "admin" ||
    admin?.role === "moderator" ||
    admin?.role === "viewer" ||
    admin?.role === "editor";

  return (
    <div className="booking-container guest-view">
      <div className="booking-hero">
        <h1>احجز موعدك الآن في مركز ميدورا الطبي</h1>
        <p>
          نقدم لك أفضل الخدمات الطبية مع نخبة من الأطباء المتخصصين. سجل الدخول
          الآن لحجز موعدك بكل سهولة ويسر.
        </p>

        <div className="booking-features">
          <div className="feature">
            <i className="fas fa-user-md"></i>
            <h3>أطباء متخصصون</h3>
            <p>نخبة من أفضل الأطباء في مختلف التخصصات</p>
          </div>
          <div className="feature">
            <i className="fas fa-clock"></i>
            <h3>مواعيد مرنة</h3>
            <p>اختر الوقت المناسب لك</p>
          </div>
          <div className="feature">
            <i className="fas fa-hand-holding-medical"></i>
            <h3>خدمة متميزة</h3>
            <p>رعاية طبية متكاملة بأعلى معايير الجودة</p>
          </div>
          <div className="feature">
            <i className="fas fa-microscope"></i>
            <h3>تقنيات حديثة</h3>
            <p>أحدث المعدات والتقنيات الطبية المتطورة</p>
          </div>
        </div>

        <div className="auth-buttons">
          <button
            className={`login-btn ${isAdmin ? "disabled" : ""}`}
            onClick={onLogin}
            disabled={isAdmin}
          >
            <i className="fas fa-sign-in-alt"></i>
            تسجيل الدخول
          </button>
          <button
            className={`register-btn ${isAdmin ? "disabled" : ""}`}
            onClick={onRegister}
            disabled={isAdmin}
          >
            <i className="fas fa-user-plus"></i>
            إنشاء حساب جديد
          </button>
        </div>
        {isAdmin && (
          <p className="admin-notice">
            لا يمكن للمشرفين تسجيل الدخول أو إنشاء حساب من صفحة الحجوزات
          </p>
        )}
      </div>
    </div>
  );
});

export default GuestView;
