import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import { supabase } from "../../../supabase/supabaseClient";
import Loader from "../../common/Loader";
import "../../../style/Booking.css";
import { useSelector, useDispatch } from "react-redux";
import { fetchServicesData } from "../../../redux/slices/siteDataSlice";
import GuestView from "./GuestView";
import AuthenticatedView from "./AuthenticatedView";

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
        // console.error("Error fetching services:", error);
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
      toast("يرجى ملء جميع الحقول المطلوبة", "warning");
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
      // console.error("Error booking appointment:", error);
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
