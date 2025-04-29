import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import styles from "../../../style/DoctorManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import useAdminState from "../../../hooks/useAdminState";
import { fetchAllDoctorsData } from "../../../redux/slices/adminSlice";
const Loader = React.lazy(() => import("../../common/Loader"));
const DoctorForm = React.lazy(() => import("./DoctorForm"));
const DoctorList = React.lazy(() => import("./DoctorList"));

const DoctorManagement = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.doctorsManagement
  );
  const admin = useAdminState();
  const canEdit = admin?.role === "super-admin" || admin?.role === "admin";
  const dispatch = useDispatch();
  const doctorsData = useSelector((state) => state.admin?.allDoctorsData);

  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [showDoctorForm, setShowDoctorForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const doctors = useMemo(() => doctorsData || [], [doctorsData]);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      if (isAuthorized) {
        dispatch(fetchAllDoctorsData());
      }
    } catch (error) {
      // console.error("Error fetching doctors:", error.message);
    } finally {
      setLoading(false);
    }
  }, [dispatch, isAuthorized]);

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      fetchDoctors();
    } else {
      setLoading(false);
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowFilters(true);
      } else {
        setShowFilters(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredDoctorsList = useMemo(() => {
    let result = [...doctors];

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((doctor) => doctor.is_active === isActive);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (doctor) =>
          doctor.full_name?.toLowerCase().includes(query) ||
          doctor.email?.toLowerCase().includes(query) ||
          doctor.phone?.toLowerCase().includes(query) ||
          doctor.doctor_services?.some((ds) =>
            ds.services?.title?.toLowerCase().includes(query)
          )
      );
    }

    return result;
  }, [doctors, statusFilter, searchQuery]);

  useEffect(() => {
    setFilteredDoctors(filteredDoctorsList);
  }, [filteredDoctorsList]);

  const handleEditDoctor = useCallback((doctor) => {
    setCurrentDoctor(doctor);
    setEditMode(true);
    setCurrentDoctorId(doctor.id);
    setShowDoctorForm(true);
  }, []);

  const handleAddDoctor = useCallback(() => {
    setEditMode(false);
    setCurrentDoctor(null);
    setCurrentDoctorId(null);
    setShowDoctorForm(true);
  }, []);

  const resetForm = useCallback(() => {
    setCurrentDoctor(null);
    setEditMode(false);
    setCurrentDoctorId(null);
    setShowDoctorForm(false);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setSearchQuery("");
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

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

      <Suspense fallback={<Loader />}>
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
      </Suspense>
    </div>
  );
};

export default React.memo(DoctorManagement);
