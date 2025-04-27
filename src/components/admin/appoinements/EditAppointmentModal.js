import React from "react";
import Loader from "../../common/Loader";

const EditAppointmentModal = ({
  isOpen,
  onClose,
  currentAppointment,
  formData,
  doctors,
  onInputChange,
  onSubmit,
  submitting,
}) => {
  if (!isOpen || !currentAppointment) return null;

  return (
    <div className="modal-overlay">
      <div className="edit-modal">
        <div className="modal-header">
          <h3>تعديل الموعد</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="patient-details">
            <p>
              <strong>المريض:</strong>{" "}
              {currentAppointment.patients?.full_name || "غير معروف"}
            </p>
            <p>
              <strong>رقم الهاتف:</strong>{" "}
              {currentAppointment.patients?.phone || "غير متوفر"}
            </p>
            <p>
              <strong>الخدمة:</strong>{" "}
              {currentAppointment.services
                ? currentAppointment.services.title
                : "غير محدد"}
            </p>
          </div>

          {currentAppointment.notes && (
            <div className="modal-notes">
              <h4>ملاحظات المريض:</h4>
              <p>{currentAppointment.notes}</p>
            </div>
          )}

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label>الطبيب المعالج:</label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={onInputChange}
              >
                <option value="">-- اختر الطبيب --</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.full_name}
                    {doctor.specialization && ` (${doctor.specialization})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>حالة الموعد:</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
                required
              >
                <option value="pending">قيد الانتظار</option>
                <option value="confirmed">مؤكد</option>
                <option value="cancelled">ملغي</option>
                <option value="completed">مكتمل</option>
              </select>
            </div>

            <div className="form-group">
              <label>تاريخ الموعد:</label>
              <input
                type="date"
                name="appointment_day"
                value={formData.appointment_day}
                onChange={onInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>وقت الموعد:</label>
              <input
                type="time"
                name="appointment_time"
                value={formData.appointment_time || ""}
                onChange={onInputChange}
              />
            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="save-button"
                disabled={submitting}
              >
                {submitting ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={submitting}
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
      {submitting && <Loader />}
    </div>
  );
};

export default EditAppointmentModal;
