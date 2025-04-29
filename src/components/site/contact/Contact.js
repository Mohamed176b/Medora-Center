import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../../style/Contact.css"; 
import Loader from "../../common/Loader";
import { useSelector, useDispatch } from "react-redux";
import { fetchContactData } from "../../../redux/slices/siteDataSlice";
import ContactPageHeader from "./ContactPageHeader";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";

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
        // console.error("Error loading contact:", error);
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
        const guestIp = await fetch("https://api.ipify.org?format=json")
          .then((r) => r.json())
          .then((data) => data.ip);

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
        const { error: insertError } = await supabase.from("messages").insert([
          {
            subject: formData.subject,
            message: formData.message,
            patient_id: user.id,
          },
        ]);

        if (insertError) throw insertError;
      }

      toast("تم إرسال رسالتك بنجاح", "success");
      setFormData({
        subject: "",
        message: "",
        guest_name: "",
        guest_email: "",
      });
      setWaitTime(null);
    } catch (error) {
      // console.error("Error sending message:", error);
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
        toast(waitMessage, "warning");
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
      <ContactPageHeader />
      <div className="contact-content">
        <ContactInfo contactInfo={contactInfo} />
        <div className="contact-form-container">
          <ContactForm
            user={user}
            isAdmin={isAdmin}
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            waitTime={waitTime}
            loading={loading}
            email={contactInfo.email}
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
