import React, { useState, useCallback } from "react";

const BookingForm = React.memo(({ services, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    service_id: "",
    appointment_day: "",
    notes: "",
  });

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(formData);
  }, [onSubmit, formData]);

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
          rows={3}
          disabled={isSubmitting}
        ></textarea>
      </div>

      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? "جاري الحجز..." : "احجز الآن"}
      </button>
    </form>
  );
});

export default BookingForm;
