import React from "react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";

const AppointmentCard = ({ appointment, onEdit, canEdit, isViewer }) => {
  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "EEEE، d MMMM yyyy", { locale: arEG });
    } catch (error) {
      return "تاريخ غير صالح";
    }
  };

  const statusTranslations = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    cancelled: "ملغي",
    completed: "مكتمل",
  };

  return (
    <div className="appointment-card">
      <div className="appointment-header">
        <div className="patient-info">
          <h3>{appointment.patients?.full_name || "مريض غير معروف"}</h3>
          <span className="patient-phone">
            {appointment.patients?.phone || "رقم غير متوفر"}
          </span>
        </div>
        <span className={`status-badge status-${appointment.status}`}>
          {statusTranslations[appointment.status] || "غير معروف"}
        </span>
      </div>

      <div className="appointment-details">
        <div className="detail-row">
          <i className="fas fa-calendar-alt detail-icon"></i>
          <div className="detail-content">
            <span className="detail-label">التاريخ:</span>
            <span className="detail-value">
              {formatDate(appointment.appointment_day)}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <i className="fas fa-clock detail-icon"></i>
          <div className="detail-content">
            <span className="detail-label">الوقت:</span>
            <span className="detail-value">
              {appointment.appointment_time || "غير محدد"}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <i className="fas fa-user-md detail-icon"></i>
          <div className="detail-content">
            <span className="detail-label">الطبيب:</span>
            <span className="detail-value">
              {appointment.doctors ? appointment.doctors.full_name : "غير محدد"}
            </span>
          </div>
        </div>

        <div className="detail-row">
          <i className="fas fa-clinic-medical detail-icon"></i>
          <div className="detail-content">
            <span className="detail-label">الخدمة:</span>
            <span className="detail-value">
              {appointment.services ? appointment.services.title : "غير محدد"}
            </span>
          </div>
        </div>

        {appointment.notes && (
          <div className="appointment-notes">
            <h4>ملاحظات:</h4>
            <p>{appointment.notes}</p>
          </div>
        )}
      </div>

      {!isViewer && canEdit && (
        <div className="appointment-actions">
          <button className="edit-button" onClick={() => onEdit(appointment)}>
            <i className="fas fa-edit" style={{ marginLeft: "5px" }}></i>
            تعديل الموعد
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
