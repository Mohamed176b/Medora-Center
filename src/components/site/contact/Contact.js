import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../../style/Contact.css"; 
import Loader from "../../common/Loader";
import { useSelector, useDispatch } from "react-redux";
import { fetchContactData } from "../../../redux/slices/siteDataSlice";
// Fix for leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Contact = () => {
  const { user } = useSelector((state) => state.user);
  const admin = useAdminState();
  const isAdmin =
    admin?.role === "super-admin" ||
    admin?.role === "admin" ||
    admin?.role === "moderator" ||
    admin?.role === "viewer" ||
    admin?.role === "editor";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [waitTime, setWaitTime] = useState(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    guest_name: "",
    guest_email: "",
  });
  const [loadingPage, setLoadingPage] = useState(true);
  const dispatch = useDispatch();
  const contactInfo = useSelector((state) => state.siteData?.contactData) || [];
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoadingPage(true);
        dispatch(fetchContactData());
      } catch (error) {
        console.error("Error loading contact:", error);
      } finally {
        setLoadingPage(false);
      }
    };

    if (!contactInfo || contactInfo.length === 0) {
      fetchContactInfo();
    } else {
      setLoadingPage(false);
    }
  }, [dispatch]); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        // الحصول على عنوان IP للزائر
        const guestIp = await fetch("https://api.ipify.org?format=json")
          .then((r) => r.json())
          .then((data) => data.ip);

        // التحقق من قيود معدل الرسائل للضيوف
        const { data: limitCheck, error: limitError } = await supabase.rpc(
          "check_guest_message_limit",
          { p_guest_ip: guestIp }
        );

        if (limitError) throw limitError;

        if (!limitCheck[0].can_send) {
          const waitTimeData = limitCheck[0].wait_time;
          const waitTimeValue = {
            hours: waitTimeData.hours || 0,
            minutes: waitTimeData.minutes || 0,
          };
          setWaitTime(waitTimeValue);
          throw new Error("rate_limited");
        }

        // إذا كان مسموحاً بالإرسال، نقوم بإعداد بيانات الرسالة
        const messageData = {
          subject: formData.subject,
          message: formData.message,
          guest_name: formData.guest_name,
          guest_email: formData.guest_email,
          guest_ip: guestIp,
        };

        const { error: insertError } = await supabase
          .from("messages")
          .insert([messageData]);

        if (insertError) throw insertError;
      } else {
        // إرسال الرسالة للمستخدم المسجل
        const { error: insertError } = await supabase.from("messages").insert([
          {
            subject: formData.subject,
            message: formData.message,
            patient_id: user.id,
          },
        ]);

        if (insertError) throw insertError;
      }

      // إعادة تعيين النموذج بعد النجاح
      toast("تم إرسال رسالتك بنجاح", "success");
      setFormData({
        subject: "",
        message: "",
        guest_name: "",
        guest_email: "",
      });
      setWaitTime(null);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.message === "rate_limited" && waitTime) {
        let waitMessage = "يرجى الانتظار ";
        if (waitTime.hours > 0) {
          waitMessage += `${waitTime.hours} ساعة `;
          if (waitTime.minutes > 0) {
            waitMessage += `و ${waitTime.minutes} دقيقة `;
          }
        } else if (waitTime.minutes > 0) {
          waitMessage += `${waitTime.minutes} دقيقة `;
        }
        waitMessage += "قبل إرسال رسالة جديدة";
        toast(waitMessage, "error");
      } else {
        toast("حدث خطأ في إرسال الرسالة", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  if (loadingPage) {
    return <Loader />;
  }
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>تواصل معنا</h1>
        <p>نحن هنا لمساعدتك والإجابة على جميع استفساراتك</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          {contactInfo && (
            <>
              {contactInfo.phone && (
                <div className="info-card">
                  <div className="info-card-icon">
                    <i className="fas fa-phone"></i>
                  </div>
                  <div className="info-card-content">
                    <h3>اتصل بنا</h3>
                    <p>{contactInfo.phone}</p>
                  </div>
                </div>
              )}
              {contactInfo.address && (
                <div className="info-card">
                  <div className="info-card-icon">
                    <i className="fa-solid fa-address-book"></i>
                  </div>
                  <div className="info-card-content">
                    <h3>العنوان</h3>
                    <p>{contactInfo.address}</p>
                  </div>
                </div>
              )}

              {contactInfo.latitude && contactInfo.longitude && (
                <div className="info-card">
                  <div className="info-card-icon">
                    <i className="fas fa-location-dot"></i>
                  </div>
                  <div className="info-card-content">
                    <h3>موقعنا</h3>
                    <div className="map-container">
                      <MapContainer
                        center={[contactInfo.latitude, contactInfo.longitude]}
                        zoom={15}
                        style={{ height: "250px", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <Marker
                          position={[
                            contactInfo.latitude,
                            contactInfo.longitude,
                          ]}
                        />
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}

              {(contactInfo.facebook_url ||
                contactInfo.instagram_url ||
                contactInfo.x_url ||
                contactInfo.threads_url) && (
                <div className="info-card">
                  <div className="info-card-icon">
                    <i className="fas fa-share-nodes"></i>
                  </div>
                  <div className="info-card-content">
                    <h3>تابعنا على</h3>
                    <div className="social-links">
                      {contactInfo.facebook_url && (
                        <a
                          href={contactInfo.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="facebook"
                        >
                          <i className="fab fa-facebook"></i>
                        </a>
                      )}
                      {contactInfo.instagram_url && (
                        <a
                          href={contactInfo.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="instagram"
                        >
                          <i className="fab fa-instagram"></i>
                        </a>
                      )}
                      {contactInfo.x_url && (
                        <a
                          href={contactInfo.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="twitter"
                        >
                          <i className="fab fa-x-twitter"></i>
                        </a>
                      )}
                      {contactInfo.threads_url && (
                        <a
                          href={contactInfo.threads_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="threads"
                        >
                          <i className="fab fa-threads"></i>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="contact-form-container">
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
                  rows="5"
                  required
                  disabled={isAdmin}
                ></textarea>
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={loading || isAdmin}
              >
                {loading
                  ? "جاري الإرسال..."
                  : isAdmin
                  ? "غير مسموح للمشرفين بالإرسال"
                  : "إرسال الرسالة"}
              </button>
              {waitTime && (
                <p className="rate-limit-message">
                  يرجى الانتظار{" "}
                  {waitTime.hours > 0
                    ? `${waitTime.hours} ساعة ${
                        waitTime.minutes > 0
                          ? `و ${waitTime.minutes} دقيقة`
                          : ""
                      }`
                    : `${waitTime.minutes} دقيقة`}{" "}
                  قبل إرسال رسالة جديدة
                </p>
              )}
              {isAdmin && (
                <p className="admin-notice">
                  لا يمكن للمشرفين إرسال رسائل من نموذج الاتصال
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
