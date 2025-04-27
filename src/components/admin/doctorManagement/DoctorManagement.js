import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import styles from "../../../style/DoctorManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import DoctorForm from "./DoctorForm";
import DoctorList from "./DoctorList";
import useAdminState from "../../../hooks/useAdminState";
import { fetchAllDoctorsData } from "../../../redux/slices/adminSlice";

const DoctorManagement = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.doctorsManagement
  );
  const admin = useAdminState();
  const canEdit = admin?.role === "super-admin" || admin?.role === "admin";
  const dispatch = useDispatch();
  const doctors = useSelector((state) => state.admin?.allDoctorsData) || [];

  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [showDoctorForm, setShowDoctorForm] = useState(false);

  // Filter and search states
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch doctors on component mount
  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      fetchDoctors();
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  // Apply filters whenever doctors, statusFilter, or searchQuery change
  useEffect(() => {
    applyFilters();
  }, [doctors, statusFilter, searchQuery]);

  // Show filters by default on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      dispatch(fetchAllDoctorsData());
      setFilteredDoctors(doctors || []);
    } catch (error) {
      console.error("Error fetching doctors:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...doctors];

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((doctor) => doctor.is_active === isActive);
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (doctor) =>
          doctor.full_name?.toLowerCase().includes(query) ||
          doctor.email?.toLowerCase().includes(query) ||
          doctor.specialization?.toLowerCase().includes(query) ||
          doctor.phone?.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(result);
  };

  const handleEditDoctor = (doctor) => {
    setCurrentDoctor(doctor);
    setEditMode(true);
    setCurrentDoctorId(doctor.id);
    setShowDoctorForm(true);
  };

  const handleAddDoctor = () => {
    setEditMode(false);
    setCurrentDoctor(null);
    setCurrentDoctorId(null);
    setShowDoctorForm(true);
  };

  const resetForm = () => {
    setCurrentDoctor(null);
    setEditMode(false);
    setCurrentDoctorId(null);
    setShowDoctorForm(false);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  return (
    <div className={styles["doctor-management-container"]}>
      <div className={styles.header}>
        <h1>إدارة الأطباء</h1>
        <div className={styles.headerActions}>
          <button
            className={styles.filterToggleBtn}
            onClick={toggleFilters}
            aria-label="عرض/إخفاء خيارات البحث والفلترة"
          >
            <i className="fas fa-filter"></i>
            <span>البحث والفلترة</span>
          </button>
          {canEdit && (
            <button className={styles.addBtn} onClick={handleAddDoctor}>
              <i className="fas fa-plus"></i> إضافة طبيب جديد
            </button>
          )}
        </div>
      </div>

      <div
        className={`${styles.filterSection} ${
          showFilters ? styles.visible : styles.hidden
        }`}
      >
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>الحالة:</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">الكل</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
            </select>
          </div>

          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="بحث عن طبيب..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <i className={`fas fa-search ${styles.searchIcon}`}></i>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.resetButton}
              onClick={clearFilters}
              disabled={statusFilter === "all" && searchQuery === ""}
            >
              إعادة ضبط
            </button>
          </div>
        </div>
      </div>

      {canEdit && showDoctorForm && (
        <DoctorForm
          editMode={editMode}
          currentDoctor={currentDoctor}
          currentDoctorId={currentDoctorId}
          resetForm={resetForm}
          fetchDoctors={fetchDoctors}
        />
      )}

      <DoctorList
        doctors={filteredDoctors}
        loading={loading}
        canEdit={canEdit}
        onEditDoctor={handleEditDoctor}
        fetchDoctors={fetchDoctors}
      />
    </div>
  );
};

export default DoctorManagement;
