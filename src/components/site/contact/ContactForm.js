import React, { useCallback } from "react";

const ContactForm = React.memo(({
  user,
  isAdmin,
  formData,
  handleInputChange,
  handleSubmit,
  waitTime,
  loading,
  email
}) => {
  const renderWaitTime = useCallback(() => {
    if (!waitTime) return null;
    return (
      <p className="rate-limit-message">
        يرجى الانتظار {waitTime.hours > 0 ? `${waitTime.hours} ساعة ${waitTime.minutes > 0 ? `و ${waitTime.minutes} دقيقة` : ""}` : `${waitTime.minutes} دقيقة`} قبل إرسال رسالة جديدة
      </p>
    );
  }, [waitTime]);

  return (
    <div className="contact-form">
      <h2>أرسل لنا رسالة</h2>
      <form onSubmit={handleSubmit}>
        {!user && (
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="guest_name">الاسم</label>
              <input
                type="text"
                id="guest_name"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleInputChange}
                required
                disabled={isAdmin}
              />
            </div>
            <div className="form-group">
              <label htmlFor="guest_email">البريد الإلكتروني</label>
              <input
                type="email"
                id="guest_email"
                name="guest_email"
                value={formData.guest_email}
                onChange={handleInputChange}
                required
                disabled={isAdmin}
              />
            </div>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="subject">الموضوع</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            required
            disabled={isAdmin}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">الرسالة</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={5}
            disabled={isAdmin}
          ></textarea>
        </div>
        <button type="submit" className="submit-button" disabled={loading || isAdmin}>
          {loading ? "جاري الإرسال..." : "إرسال"}
        </button>
        {renderWaitTime()}
        {isAdmin && (
          <p className="admin-notice">
            لا يمكن للمشرفين إرسال رسائل من نموذج الاتصال
          </p>
        )}
      </form>
      {email && (
        <div style={{ marginTop: 24 }}>
          <div className="info-card">
            <div className="info-card-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="info-card-content">
              <h3>تواصل معنا عبر الايميل</h3>
              <p>{email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ContactForm;
