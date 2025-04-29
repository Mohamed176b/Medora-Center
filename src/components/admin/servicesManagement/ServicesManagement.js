import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { supabase } from "../../../supabase/supabaseClient";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import styles from "../../../style/ServicesManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import useAdminState from "../../../hooks/useAdminState";
import { fetchAllServicesData } from "../../../redux/slices/adminSlice";
const Loader = React.lazy(() => import("../../common/Loader"));

const ServiceForm = lazy(() =>
  import("./ServiceForm").then((module) => ({
    default: module.default,
  }))
);
const ServicesList = lazy(() =>
  import("./ServicesList").then((module) => ({
    default: module.default,
  }))
);

const ServicesManagement = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.servicesManagement
  );
  const dispatch = useDispatch();
  const admin = useAdminState();
  const canEdit = admin?.role === "super-admin" || admin?.role === "admin";
  const services = useSelector((state) => state.admin?.allServicesData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    is_active: true,
    icon: "",
  });

  const [iconSearch, setIconSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if ((!services || services.length === 0) && isAuthorized) {
      fetchServices();
    } else {
      setLoading(false);
    }
  }, [dispatch, isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const filteredServices = useMemo(() => {
    let result = [...(services || [])];

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      result = result.filter((service) => service.is_active === isActive);
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (service) =>
          service.title?.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.slug?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [services, statusFilter, searchQuery]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleIconSelect = useCallback((iconValue) => {
    setFormData((prev) => ({
      ...prev,
      icon: iconValue,
    }));
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

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      slug: "",
      is_active: true,
      icon: "",
    });
    setIconSearch("");
    setEditMode(false);
    setCurrentServiceId(null);
    setShowServiceForm(false);
  }, []);

  const handleEditService = useCallback((service) => {
    setFormData({
      title: service.title,
      description: service.description,
      slug: service.slug || "",
      is_active: service.is_active,
      icon: service.icon || "",
    });
    setEditMode(true);
    setCurrentServiceId(service.id);
    setShowServiceForm(true);
  }, []);

  const handleAddService = useCallback(() => {
    resetForm();
    setShowServiceForm(true);
  }, [resetForm]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      dispatch(fetchAllServicesData());
    } catch (error) {
      // console.error("خطأ في جلب الخدمات:", error.message);
      dispatch(
        showToast({
          message: `خطأ في جلب الخدمات: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setSaving(true);

      if (!formData.title || !formData.description) {
        throw new Error("العنوان والوصف مطلوبان");
      }

      let slug = formData.slug;
      if (!slug) {
        slug = formData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]+/g, ""); // eslint-disable-line no-useless-escape
      }

      const { data: existingWithSlug, error: slugCheckError } = await supabase
        .from("services")
        .select("id, slug")
        .eq("slug", slug);

      if (slugCheckError) throw slugCheckError;

      if (existingWithSlug && existingWithSlug.length > 0) {
        if (editMode && existingWithSlug[0].id === currentServiceId) {
        } else {
          const timestamp = new Date().getTime().toString().slice(-4);
          slug = `${slug}-${timestamp}`;
        }
      }

      const updatedFormData = {
        ...formData,
        slug: slug,
      };

      let result; // eslint-disable-line no-unused-vars

      if (editMode) {
        const { data, error } = await supabase
          .from("services")
          .update(updatedFormData)
          .eq("id", currentServiceId)
          .select()
          .single();

        if (error) throw error;
        result = data;

        dispatch(
          showToast({
            message: "تم تحديث الخدمة بنجاح",
            type: "success",
          })
        );
      } else {
        const { data: maxOrderService, error: maxOrderError } = await supabase
          .from("services")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        let displayOrder = 10; 
        if (!maxOrderError && maxOrderService && maxOrderService.length > 0) {
          displayOrder = (maxOrderService[0].display_order || 0) + 10;
        }

        const newService = {
          ...updatedFormData,
          display_order: displayOrder,
        };

        const { data, error } = await supabase
          .from("services")
          .insert([newService])
          .select()
          .single();

        if (error) throw error;
        result = data; // eslint-disable-line no-unused-vars

        dispatch(
          showToast({
            message: "تم إضافة الخدمة بنجاح",
            type: "success",
          })
        );
      }

      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error.message);

      if (
        error.message.includes("violates unique constraint") &&
        error.message.includes("services_slug_key")
      ) {
        dispatch(
          showToast({
            message:
              "خطأ: يوجد خدمة أخرى بنفس الرابط المميز (slug). قم بتغيير الرابط المميز.",
            type: "error",
          })
        );
      } else {
        dispatch(
          showToast({
            message: `خطأ في حفظ الخدمة: ${error.message}`,
            type: "error",
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!canEdit) return;

    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) {
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;

      dispatch(
        showToast({
          message: "تم حذف الخدمة بنجاح",
          type: "success",
        })
      );

      fetchServices();
    } catch (error) {
      // console.error("خطأ في حذف الخدمة:", error.message);
      dispatch(
        showToast({
          message: `خطأ في حذف الخدمة: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const moveServiceUp = async (service) => {
    if (!canEdit) return;

    try {
      setLoading(true);

      const { data: prevServices, error: prevError } = await supabase
        .from("services")
        .select("*")
        .lt("display_order", service.display_order)
        .order("display_order", { ascending: false })
        .limit(1);

      if (prevError) throw prevError;

      if (!prevServices || prevServices.length === 0) {
        dispatch(
          showToast({
            message: "هذه الخدمة بالفعل في أعلى القائمة",
            type: "info",
          })
        );
        setLoading(false);
        return;
      }

      const prevService = prevServices[0];

      const { error: updateCurrentError } = await supabase
        .from("services")
        .update({ display_order: prevService.display_order })
        .eq("id", service.id);

      if (updateCurrentError) throw updateCurrentError;

      const { error: updatePrevError } = await supabase
        .from("services")
        .update({ display_order: service.display_order })
        .eq("id", prevService.id);

      if (updatePrevError) throw updatePrevError;

      dispatch(
        showToast({
          message: "تم تحديث ترتيب الخدمة بنجاح",
          type: "success",
        })
      );

      fetchServices();
    } catch (error) {
      // console.error("خطأ في تحديث ترتيب الخدمة:", error.message);
      dispatch(
        showToast({
          message: `خطأ في تحديث ترتيب الخدمة: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const moveServiceDown = async (service) => {
    if (!canEdit) return;

    try {
      setLoading(true);

      const { data: nextServices, error: nextError } = await supabase
        .from("services")
        .select("*")
        .gt("display_order", service.display_order)
        .order("display_order", { ascending: true })
        .limit(1);

      if (nextError) throw nextError;

      if (!nextServices || nextServices.length === 0) {
        dispatch(
          showToast({
            message: "هذه الخدمة بالفعل في آخر القائمة",
            type: "info",
          })
        );
        setLoading(false);
        return;
      }

      const nextService = nextServices[0];

      const { error: updateCurrentError } = await supabase
        .from("services")
        .update({ display_order: nextService.display_order })
        .eq("id", service.id);

      if (updateCurrentError) throw updateCurrentError;

      const { error: updateNextError } = await supabase
        .from("services")
        .update({ display_order: service.display_order })
        .eq("id", nextService.id);

      if (updateNextError) throw updateNextError;

      dispatch(
        showToast({
          message: "تم تحديث ترتيب الخدمة بنجاح",
          type: "success",
        })
      );

      fetchServices();
    } catch (error) {
      // console.error("خطأ في تحديث ترتيب الخدمة:", error.message);
      dispatch(
        showToast({
          message: `خطأ في تحديث ترتيب الخدمة: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  return (
    <div className={styles["services-management"]}>
      <div className={styles.header}>
        <h2 className={styles["section-title"]}>إدارة الخدمات</h2>
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
            <button className={styles.addBtn} onClick={handleAddService}>
              <i className="fas fa-plus"></i> إضافة خدمة جديدة
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
              placeholder="بحث عن خدمة..."
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
        {canEdit && showServiceForm && (
          <ServiceForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            handleIconSelect={handleIconSelect}
            iconSearch={iconSearch}
            setIconSearch={setIconSearch}
            resetForm={resetForm}
            editMode={editMode}
            saving={saving}
            canEdit={canEdit}
          />
        )}

        <div className={styles["services-list"]}>
          <h3>قائمة الخدمات</h3>
          <ServicesList
            services={filteredServices}
            loading={loading}
            canEdit={canEdit}
            handleEditService={handleEditService}
            handleDeleteService={handleDeleteService}
            moveServiceUp={moveServiceUp}
            moveServiceDown={moveServiceDown}
          />
        </div>
      </Suspense>
    </div>
  );
};

export default React.memo(ServicesManagement);
