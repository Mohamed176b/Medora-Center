import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import { supabase } from "../../../supabase/supabaseClient";
import Loader from "../../common/Loader";
import useAdminState from "../../../hooks/useAdminState";
import "../../../style/Booking.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchServicesData } from "../../../redux/slices/siteDataSlice";
// مكون عرض الضيف
const GuestView = ({ onLogin, onRegister }) => {
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
};

// مكون نموذج الحجز
const BookingForm = ({ services, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    service_id: "",
    appointment_day: "",
    notes: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="modern-form">
      <div className="form-group">
        <label htmlFor="service_id">الخدمة الطبية</label>
        <select
          id="service_id"
          name="service_id"
          value={formData.service_id}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        >
          <option value="">-- اختر الخدمة --</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.title}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="appointment_day">التاريخ المفضل للموعد</label>
        <input
          type="date"
          id="appointment_day"
          name="appointment_day"
          value={formData.appointment_day}
          onChange={handleInputChange}
          min={new Date().toISOString().split("T")[0]}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">ملاحظات إضافية</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows="4"
          placeholder="أضف أي ملاحظات أو معلومات إضافية تساعد في تحديد الطبيب المناسب لحالتك والوقت المفضل لديك"
          disabled={isSubmitting}
        ></textarea>
      </div>

      <div className="note-box">
        <p>
          <i className="fas fa-info-circle"></i>
          سيتم تحديد الطبيب المناسب والوقت المناسب لموعدك من قبل المركز بعد
          مراجعة طلبك
        </p>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? "جاري حجز الموعد..." : "تأكيد الحجز"}
      </button>
    </form>
  );
};

// مكون عرض المستخدم المسجل
const AuthenticatedView = ({
  services,
  onSubmit,
  isSubmitting,
  onViewAppointments,
}) => (
  <div className="booking-container authenticated-view">
    <div className="booking-header">
      <h1>حجز موعد جديد</h1>
      <button className="view-appointments-btn" onClick={onViewAppointments}>
        <i className="fas fa-calendar-check"></i>
        عرض مواعيدي السابقة
      </button>
    </div>

    <div className="booking-form-container">
      <BookingForm
        services={services}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  </div>
);

// المكون الرئيسي
const Booking = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const services = useSelector((state) => state.siteData?.servicesData) || [];
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (!isAuthenticated) {
          setIsLoading(false);
          return;
        }
        dispatch(fetchServicesData());
      } catch (error) {
        console.error("Error fetching services:", error);
        toast("حدث خطأ أثناء تحميل الخدمات", "error");
      } finally {
        setIsLoading(false);
      }
    };
    if (!services || services.length === 0) {
      loadInitialData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, dispatch]);

  const handleSubmit = async (formData) => {
    if (!formData.service_id || !formData.appointment_day) {
      toast("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("appointments").insert([
        {
          patient_id: user.id,
          service_id: formData.service_id,
          appointment_day: formData.appointment_day,
          notes: formData.notes,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast(
        "تم حجز الموعد بنجاح، سيتم تحديد الطبيب المناسب والوقت المناسب من قبل المركز",
        "success"
      );
      navigate("/profile/appointments");
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast("حدث خطأ أثناء حجز الموعد", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <GuestView
        onLogin={() => navigate("/login")}
        onRegister={() => navigate("/register")}
      />
    );
  }

  return (
    <AuthenticatedView
      services={services}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      onViewAppointments={() => navigate("/profile/appointments")}
    />
  );
};

export default Booking;
