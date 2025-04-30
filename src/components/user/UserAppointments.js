import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import useToast from "../../hooks/useToast";
import "../../style/UserAppointments.css";
import Loader from "../common/Loader";
import {
  fetchServicesData,
  fetchDoctorsData,
} from "../../redux/slices/siteDataSlice";
import {
  fetchUserAppointments,
  deleteUserAppointment,
  updateUserAppointment,
  createUserAppointment,
} from "../../redux/slices/userSlice";

const UserAppointments = memo(() => {
  const { user } = useSelector((state) => state.user);
  const {
    appointments,
    appointmentsLoading: loading,
    appointmentsError,
  } = useSelector((state) => state.user);
  const servicesData = useSelector((state) => state.siteData?.servicesData);
  const doctorsData = useSelector((state) => state.siteData?.doctorsData);

    const services = useMemo(() => servicesData || [], [servicesData]);
  const doctors = useMemo(() => doctorsData || [], [doctorsData]);

  const dispatch = useDispatch();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    service_id: "",
    appointment_day: "",
    notes: "",
  });

  useEffect(() => {
    document.title = "مواعيدك | مركز ميدورا";
  }, []);
  
  useEffect(() => {
    if (!services.length) {
      dispatch(fetchServicesData());
    }
    if (!doctors.length) {
      dispatch(fetchDoctorsData());
    }
    if (user && (!appointments || appointments.length === 0)) {
      dispatch(fetchUserAppointments(user.id));
    }
  }, [dispatch, user]);

  const resetForm = useCallback(() => {
    setFormData({
      service_id: "",
      appointment_day: "",
      notes: "",
    });
    setEditingAppointment(null);
    setIsEditing(false);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.service_id || !formData.appointment_day) {
      toast("يرجى ملء جميع الحقول المطلوبة", "error");
      return;
    }

    setSubmitting(true);

    try {
      if (isEditing && editingAppointment) {
        const result = await dispatch(
          updateUserAppointment({
            appointmentId: editingAppointment.id,
            userId: user.id,
            updateData: {
              service_id: formData.service_id,
              appointment_day: formData.appointment_day,
              notes: formData.notes,
            },
          })
        ).unwrap();

        if (result) {
          toast("تم تحديث الموعد بنجاح", "success");
          resetForm();
        }
      } else {
        const result = await dispatch(
          createUserAppointment({
            userId: user.id,
            appointmentData: {
              service_id: formData.service_id,
              appointment_day: formData.appointment_day,
              notes: formData.notes,
              status: "pending",
            },
          })
        ).unwrap();

        if (result) {
          toast(
            "تم حجز الموعد بنجاح، سيتم تحديد الطبيب المناسب والوقت المناسب من قبل المركز",
            "success"
          );
          resetForm();
          dispatch(fetchUserAppointments(user.id));
        }
      }
    } catch (error) {
      // console.error("Error with appointment:", error);
      toast(
        isEditing ? "حدث خطأ أثناء تحديث الموعد" : "حدث خطأ أثناء حجز الموعد",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }, [formData, isEditing, editingAppointment, user, toast, dispatch]);

  const handleEdit = (appointment) => {
    setFormData({
      service_id: appointment.service_id,
      appointment_day: appointment.appointment_day,
      notes: appointment.notes || "",
    });
    setEditingAppointment(appointment);
    setIsEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    try {
      setSubmitting(true);
      const result = await dispatch(
        deleteUserAppointment({
          appointmentId: id,
          userId: user.id,
        })
      ).unwrap();

      if (result) {
        toast("تم حذف الموعد بنجاح", "success");
        setDeleteConfirm(null);
      }
    } catch (error) {
      // console.error("Error deleting appointment:", error);
      toast("حدث خطأ أثناء حذف الموعد", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    resetForm();
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return "غير محدد";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("ar-EG", options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "لم يتم تحديد الوقت بعد";

    try {
      if (timeString.length <= 8) {
        const [hours, minutes] = timeString.split(":");
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return date.toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      else {
        return new Date(timeString).toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    } catch (error) {
      // console.error("Error formatting time:", error);
      return "لم يتم تحديد الوقت بعد";
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      cancelled: "ملغي",
      completed: "مكتمل",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClassMap = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      cancelled: "status-cancelled",
      completed: "status-completed",
    };
    return statusClassMap[status] || "";
  };

  if (loading) {
    return <Loader />;
  }

  if (appointmentsError) {
    toast(appointmentsError, "error");
  }

  return (
    <div className="user-appointments-container">
      <div className="appointments-header">
        <h1>حجوزاتك الطبية</h1>
      </div>

      <div className="appointments-content">
        <div className="new-appointment-form">
          <h2>{isEditing ? "تعديل الموعد" : "حجز موعد جديد"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="service_id">الخدمة الطبية</label>
              <select
                id="service_id"
                name="service_id"
                value={formData.service_id}
                onChange={handleInputChange}
                required
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">ملاحظات إضافية</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="أضف أي ملاحظات أو معلومات إضافية تساعد في تحديد الطبيب المناسب لحالتك والوقت المفضل لديك"
              ></textarea>
            </div>

            {!isEditing && (
              <div className="note-box">
                <p>
                  <i className="fas fa-info-circle"></i> سيتم تحديد الطبيب
                  المناسب والوقت المناسب لموعدك من قبل المركز بعد مراجعة طلبك
                </p>
              </div>
            )}

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting
                  ? isEditing
                    ? "جاري التحديث..."
                    : "جاري الحجز..."
                  : isEditing
                  ? "تحديث الموعد"
                  : "تأكيد الحجز"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelEdit}
                  disabled={submitting}
                >
                  إلغاء التعديل
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="appointments-list">
          <h2>مواعيدك المحجوزة</h2>
          {appointments.length === 0 ? (
            <p className="no-data-message">لم تقم بحجز أي مواعيد حتى الآن</p>
          ) : (
            <div className="appointments-items">
              {appointments.map((appointment) => (
                <div className="appointment-item" key={appointment.id}>
                  {deleteConfirm === appointment.id && (
                    <div className="delete-confirm">
                      <p>هل أنت متأكد من حذف هذا الموعد؟</p>
                      <div className="confirm-actions">
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          disabled={submitting}
                          className="confirm-delete"
                        >
                          {submitting ? "جاري الحذف..." : "نعم، احذف الموعد"}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="cancel-delete"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="appointment-header">
                    <h3>{appointment.services?.title || "خدمة غير محددة"}</h3>
                    <span
                      className={`appointment-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  <div className="appointment-details">
                    {appointment.doctor_id && appointment.doctor_details && (
                      <div className="doctor-details">
                        {appointment.doctor_details.image_url && (
                          <div className="doctor-image">
                            <img
                              src={appointment.doctor_details.image_url}
                              alt={appointment.doctor_details.full_name}
                            />
                          </div>
                        )}
                        <div className="doctor-info">
                          <div className="detail-item">
                            <span className="detail-label">الطبيب:</span>
                            <span className="detail-value">
                              {appointment.doctor_details.full_name}
                            </span>
                          </div>
                          {appointment.doctor_details.specialization && (
                            <div className="detail-item">
                              <span className="detail-label">الخدمة:</span>
                              <span className="detail-value">
                                {appointment.doctor_details.services?.title ||
                                  "غير محدد"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="detail-item">
                      <span className="detail-label">التاريخ:</span>
                      <span className="detail-value">
                        {formatDateOnly(appointment.appointment_day)}
                      </span>
                    </div>

                    <div className="detail-item time-item">
                      <span className="detail-label">الوقت:</span>
                      {appointment.appointment_time ? (
                        <span className="detail-value">
                          {formatTime(appointment.appointment_time)}
                        </span>
                      ) : (
                        <span className="detail-value time-not-set">
                          لم يتم تحديد الوقت بعد
                        </span>
                      )}
                    </div>

                    {appointment.notes && (
                      <div className="detail-item">
                        <span className="detail-label">ملاحظات:</span>
                        <span className="detail-value">
                          {appointment.notes}
                        </span>
                      </div>
                    )}
                    {appointment.doctor_id && (
                      <div className="detail-item doctor-item">
                        <span className="detail-label">الطبيب:</span>
                        <span className="detail-value">
                          {(() => {
                            const doctor = doctors.find((doc) => doc.id === appointment.doctor_id);
                            return doctor ? doctor.full_name : "-";
                          })()}
                        </span>
                      </div>
                    )}
                  </div>

                  {appointment.status === "pending" && (
                    <div className="appointment-actions">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="edit-button"
                        disabled={isEditing || submitting}
                      >
                        <i className="fas fa-edit"></i> تعديل
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(appointment.id)}
                        className="delete-button"
                        disabled={isEditing || submitting}
                      >
                        <i className="fas fa-trash"></i> حذف
                      </button>
                    </div>
                  )}

                  {appointment.status === "pending" &&
                    !appointment.doctor_id && (
                      <div className="appointment-note">
                        <p>
                          لم يتم تعيين طبيب والوقت المحدد بعد. سيتم تأكيد
                          التفاصيل قريبًا.
                        </p>
                      </div>
                    )}

                  {appointment.status !== "pending" && (
                    <div className="appointment-footer">
                      <div className="cancel-note">
                        <i className="fas fa-info-circle"></i>
                        <span>لإلغاء الموعد، يرجى التواصل مع الدعم الفني</span>
                      </div>
                    </div>
                  )}
                  {appointment.status === "completed" && (
                    <></>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default UserAppointments;
