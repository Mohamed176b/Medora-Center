import React from "react";
import BookingForm from "./BookingForm";

const AuthenticatedView = React.memo(({ services, onSubmit, isSubmitting, onViewAppointments }) => (
  <div className="booking-container auth-view">
    <div className="booking-hero">
      <h1>حجز موعد جديد</h1>
      <p>
        يرجى اختيار الخدمة الطبية وتحديد التاريخ المناسب، وسيقوم فريقنا
        بالتواصل معك لتأكيد الحجز.
      </p>
    </div>
    <BookingForm
      services={services}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
    <div style={{ marginTop: 24 }}>
      <button className="view-appointments-btn" onClick={onViewAppointments}>
        عرض حجوزاتي
      </button>
    </div>
  </div>
));

export default AuthenticatedView;
