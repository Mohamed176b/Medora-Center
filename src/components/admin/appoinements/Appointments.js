import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import "../../../style/Appointments.css";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAppointmentsData } from "../../../redux/slices/adminSlice";
import { fetchDoctorsData } from "../../../redux/slices/siteDataSlice";
const Loader = React.lazy(() => import("../../common/Loader"));
const AppointmentHeader = React.lazy(() => import("./AppointmentHeader"));
const AppointmentFilters = React.lazy(() => import("./AppointmentFilters"));
const AppointmentCard = React.lazy(() => import("./AppointmentCard"));
const EditAppointmentModal = React.lazy(() => import("./EditAppointmentModal"));

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
  const [loading, setLoading] = useState(true);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const doctorsData = useSelector((state) => state.siteData?.doctorsData);
  const doctors = useMemo(() => doctorsData || [], [doctorsData]);

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
    service_id: "",
  });

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
  }, [dispatch, isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

  const allAppointmentsData = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(fetchAllAppointmentsData());
    } catch (error) {
      // console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب المواعيد: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast]);

  const allDoctorsData = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(fetchDoctorsData());
    } catch (error) {
      // console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب الاطباء: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const openEditModal = useCallback(
    (appointment) => {
      if (!canEdit) return;

      setCurrentAppointment(appointment);
      setFormData({
        doctor_id: appointment.doctor_id || "",
        status: appointment.status || "pending",
        appointment_day: appointment.appointment_day || "",
        appointment_time: appointment.appointment_time || "",
        service_id: appointment.service_id || "",
      });
      setIsModalOpen(true);
    },
    [canEdit]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentAppointment(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Submit appointment edit
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!currentAppointment || !canEdit) return;

      try {
        setSubmitting(true);

        if (formData.doctor_id) {
          const selectedDoctor = doctors.find(
            (d) => d.id === formData.doctor_id
          );
          const hasService = selectedDoctor?.doctor_services?.some(
            (ds) => ds.service_id === currentAppointment.service_id
          );

          if (!hasService) {
            throw new Error("الطبيب المختار لا يقدم الخدمة المطلوبة");
          }
        }

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
        // console.error("Error updating appointment:", error);
        toast(error.message || "حدث خطأ أثناء تحديث الموعد", "error");
      } finally {
        setSubmitting(false);
      }
    },
    [
      currentAppointment,
      canEdit,
      formData,
      doctors,
      toast,
      closeModal,
      allAppointmentsData,
    ]
  );

  const memoizedFilteredAppointments = useMemo(() => {
    if (appointments.length === 0) return [];

    let result = [...appointments];

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

    if (statusFilter !== "all") {
      result = result.filter(
        (appointment) => appointment.status === statusFilter
      );
    }

    return result;
  }, [appointments, searchTerm, statusFilter]);

  useEffect(() => {
    setFilteredAppointments(memoizedFilteredAppointments);
  }, [memoizedFilteredAppointments]);

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
      {filteredAppointments.length === 0 && (
        <div className="no-appointments">
          <h3>لا توجد مواعيد متاحة</h3>
          <p>لم يتم العثور على مواعيد تطابق معايير البحث الحالية</p>
        </div>
      )}
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
