import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import "../../../style/Appointments.css";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import Loader from "../../common/Loader";
import AppointmentHeader from "./AppointmentHeader";
import AppointmentFilters from "./AppointmentFilters";
import AppointmentCard from "./AppointmentCard";
import EditAppointmentModal from "./EditAppointmentModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAppointmentsData } from "../../../redux/slices/adminSlice";
import { fetchDoctorsData } from "../../../redux/slices/siteDataSlice";

const Appointments = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.appointments
  );
  const admin = useAdminState();
  const canEdit =
    admin?.role === "super-admin" ||
    admin?.role === "admin" ||
    admin?.role === "moderator";
  const isViewer = admin?.role === "viewer";
  const { toast } = useToast();
  const dispatch = useDispatch();
  const appointments = useSelector((state) => state.admin.allAppointmentsData);
  // State management
  const [loading, setLoading] = useState(true);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];
  const [submitting, setSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    doctor_id: "",
    status: "",
    appointment_day: "",
    appointment_time: "",
  });

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthorized) {
      if (!appointments || appointments.length === 0) {
        allAppointmentsData();
      } else {
        setLoading(false);
      }
      if (!doctors || doctors.length === 0) {
        allDoctorsData();
      } else {
        setLoading(false);
      }
    }
  }, [dispatch, isAuthorized]);

  const allAppointmentsData = async () => {
    try {
      setLoading(true);
      dispatch(fetchAllAppointmentsData());
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب المواعيد: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const allDoctorsData = async () => {
    try {
      setLoading(true);
      dispatch(fetchDoctorsData());
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب الاطباء: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };


  // Filter appointments based on search term and status filter
  useEffect(() => {
    if (appointments.length === 0) return;

    let result = [...appointments];

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(
        (appointment) =>
          (appointment.patients?.full_name || "")
            .toLowerCase()
            .includes(searchTermLower) ||
          (appointment.patients?.phone || "").includes(searchTerm) ||
          (appointment.doctors?.full_name || "")
            .toLowerCase()
            .includes(searchTermLower) ||
          (appointment.services?.title || "")
            .toLowerCase()
            .includes(searchTermLower) ||
          (appointment.notes || "").toLowerCase().includes(searchTermLower)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    setFilteredAppointments(result);
  }, [searchTerm, statusFilter, appointments]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Open edit modal for an appointment
  const openEditModal = (appointment) => {
    if (!canEdit) return;

    setCurrentAppointment(appointment);
    setFormData({
      doctor_id: appointment.doctor_id || "",
      status: appointment.status || "pending",
      appointment_day: appointment.appointment_day || "",
      appointment_time: appointment.appointment_time || "",
    });
    setIsModalOpen(true);
  };

  // Close edit modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentAppointment(null);
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit appointment edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentAppointment || !canEdit) return;

    try {
      setSubmitting(true);

      const { error } = await supabase
        .from("appointments")
        .update({
          doctor_id: formData.doctor_id || null,
          status: formData.status,
          appointment_day: formData.appointment_day,
          appointment_time: formData.appointment_time || null,
        })
        .eq("id", currentAppointment.id);

      if (error) throw error;

      toast("تم تحديث الموعد بنجاح", "success");
      closeModal();
      allAppointmentsData();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast("حدث خطأ أثناء تحديث الموعد", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="appointments-admin-container">
      <AppointmentHeader
        totalCount={appointments.length}
        filteredCount={filteredAppointments.length}
      />

      <AppointmentFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      {filteredAppointments.length > 0 && (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={openEditModal}
              canEdit={canEdit}
              isViewer={isViewer}
            />
          ))}
        </div>
      )}

      <EditAppointmentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentAppointment={currentAppointment}
        formData={formData}
        doctors={doctors}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default Appointments;
