import React, { useState, useEffect, useMemo } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/AdminsManagement.module.css";
import Loader from "../../common/Loader";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAdminsData } from "../../../redux/slices/adminSlice";
// استيراد المكونات الفرعية
import AdminsHeader from "./AdminsHeader";
import AdminsFilter from "./AdminsFilter";
import AdminsTable from "./AdminsTable";
import AdminCards from "./AdminCards";
import AdminForm from "./AdminForm";

// استيراد الوظائف المساعدة
import {
  logDebugInfo,
  getRoleBadgeClass,
  getStatusBadgeClass,
  getRoleTranslation,
} from "../../../utils/adminHelpers";

const AdminsManagement = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.adminsManagement
  );
  const admin = useAdminState();
  const canEdit = admin?.role === "super-admin";
  const isViewer = admin?.role === "viewer";
  const { toast } = useToast();

  const dispatch = useDispatch();
  const admins = useSelector((state) => state.admin.allAdminsData);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "viewer",
    is_active: true,
  });
  const [error, setError] = useState(null);

  // حالات الفلترة والبحث
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      dispatch(fetchAllAdminsData());
      logDebugInfo("تم جلب المسؤولين بنجاح", { count: admins?.length });
    } catch (error) {
      console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب المسؤولين: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch admins on component mount
  useEffect(() => {
    if (!admins || admins.length === 0) {
      fetchAdmins();
    } else {
      setLoading(false);
    }
  }, [dispatch]); // Added missing dependencies

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

  // ضبط قيم الفلترة
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // إعادة ضبط جميع الفلاتر
  const resetFilters = () => {
    setFilters({
      role: "",
      isActive: "",
      searchQuery: "",
    });
  };

  // تبديل ظهور قسم الفلترة
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // تطبيق الفلترة على بيانات المسؤولين
  const filteredAdmins = useMemo(() => {
    // Return empty array if admins is null or undefined
    if (!Array.isArray(admins)) return [];

    return admins.filter((admin) => {
      // فلترة حسب الدور
      if (filters.role && admin.role !== filters.role) {
        return false;
      }

      // فلترة حسب حالة النشاط
      if (filters.isActive !== "") {
        const activeStatus = filters.isActive === "active";
        if (admin.is_active !== activeStatus) {
          return false;
        }
      }

      // البحث
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          admin.full_name.toLowerCase().includes(query) ||
          admin.email.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [admins, filters]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentAdmin(null);
    setFormData({
      full_name: "",
      email: "",
      role: "viewer",
      is_active: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (admin) => {
    setEditMode(true);
    setCurrentAdmin(admin);
    setFormData({
      full_name: admin.full_name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editMode) {
        if (
          currentAdmin.role === "super-admin" &&
          formData.role !== "super-admin"
        ) {
          setError("لا يمكن تغيير دور السوبر أدمن");
          setSubmitting(false);
          return;
        }

        // تسجيل معلومات التصحيح
        logDebugInfo("تحديث المستخدم", {
          id: currentAdmin.id,
          role: formData.role,
          data: formData,
        });

        // استخدام RPC لتجاوز سياسات الحماية
        const { data, error } = await supabase.rpc("update_admin_user", {
          admin_id: currentAdmin.id,
          admin_full_name: formData.full_name,
          admin_role: formData.role,
          admin_is_active: formData.is_active,
        });

        if (error) {
          logDebugInfo("خطأ في التحديث", error);
          setError(`خطأ في تحديث المستخدم: ${error.message}`);
          setSubmitting(false);
          return;
        }

        // التحقق من نجاح العملية (الوظيفة ترجع Boolean الآن)
        if (data === false) {
          setError("فشلت عملية التحديث. تأكد من أن لديك الصلاحيات المناسبة.");
          setSubmitting(false);
          return;
        }

        toast("تم تحديث بيانات المستخدم بنجاح", "success");
      } else {
        // البحث عن المستخدم في نظام المصادقة
        logDebugInfo("البحث عن مستخدم بالبريد", formData.email);

        // استخدام RPC لاسترجاع معرف المستخدم
        const { data: userId, error: userIdError } = await supabase.rpc(
          "get_user_id_by_email",
          { email_input: formData.email }
        );

        if (userIdError || !userId) {
          logDebugInfo("خطأ في البحث عن المستخدم", {
            error: userIdError,
            userId,
          });
          setError(
            "لم يتم العثور على المستخدم في نظام المصادقة. يرجى التأكد من إنشاء الحساب أولاً."
          );
          setSubmitting(false);
          return;
        }

        logDebugInfo("تم العثور على المستخدم", { userId });

        // استخدام RPC لإضافة مستخدم مع تجاوز سياسات الحماية
        const { data, error } = await supabase.rpc("add_admin_user", {
          admin_id: userId,
          admin_full_name: formData.full_name,
          admin_email: formData.email,
          admin_role: formData.role,
          admin_is_active: formData.is_active,
        });

        if (error) {
          logDebugInfo("خطأ في إضافة المستخدم", error);

          if (error.code === "23505") {
            setError("هذا المستخدم موجود بالفعل في نظام إدارة المسؤولين");
          } else if (error.code === "22P02") {
            setError("قيمة الدور غير صالحة. تأكد من استخدام قيمة صحيحة للدور.");
          } else {
            setError(
              `خطأ في إضافة المستخدم: ${error.message} (كود: ${error.code})`
            );
          }
          setSubmitting(false);
          return;
        }

        // التحقق من نجاح العملية (الوظيفة ترجع Boolean الآن)
        if (data === false) {
          setError("فشلت عملية الإضافة. تأكد من أن لديك الصلاحيات المناسبة.");
          setSubmitting(false);
          return;
        }

        toast("تمت إضافة المستخدم بنجاح", "success");
      }

      fetchAdmins();
      closeModal();
    } catch (error) {
      console.error("Error handling admin:", error);
      toast(`حدث خطأ: ${error.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adminId) => {
    const adminToDelete = admins.find((admin) => admin.id === adminId);
    if (adminToDelete && adminToDelete.role === "super-admin") {
      toast("لا يمكن حذف مستخدم بدور السوبر أدمن", "error");
      return;
    }

    // استخدام مربع حوار واحد مع خيارات متعددة بدلاً من مربعات متعددة
    const confirmResult = window.confirm(
      "هل أنت متأكد من حذف هذا المستخدم من نظام المسؤولين؟"
    );

    if (confirmResult) {
      // سؤال المستخدم عن حذفه من نظام المصادقة
      const deleteAuthUser = window.confirm(
        "هل تريد أيضاً حذف المستخدم من نظام المصادقة؟ (هذا سيؤدي إلى حذف حسابه بالكامل وقد يؤثر على البيانات المرتبطة به)"
      );

      setSubmitting(true);
      try {
        logDebugInfo("حذف المستخدم", { id: adminId, deleteAuthUser });

        // استخدام RPC لحذف المستخدم
        const { data, error } = await supabase.rpc("delete_admin_user", {
          admin_id: adminId,
          delete_auth_user: deleteAuthUser,
        });

        if (error) {
          logDebugInfo("خطأ في حذف المستخدم", error);
          toast(`خطأ في حذف المستخدم: ${error.message}`, "error");
          setSubmitting(false);
          return;
        }

        // التحقق من نجاح العملية
        if (data === false) {
          toast(
            "فشلت عملية الحذف. تأكد من أن لديك الصلاحيات المناسبة.",
            "error"
          );
          setSubmitting(false);
          return;
        }

        toast(
          `تم حذف المستخدم بنجاح ${
            deleteAuthUser ? "بالكامل من النظام" : "من نظام المسؤولين فقط"
          }`,
          "success"
        );
        fetchAdmins();
      } catch (error) {
        console.error("Error deleting admin:", error);
        toast(error.message, "error");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (submitting) {
    return <Loader />;
  }

  return (
    <div className={styles.adminsManagement}>
      {/* رأس الصفحة */}
      <AdminsHeader
        canEdit={canEdit}
        isViewer={isViewer}
        openAddModal={openAddModal}
        toggleFilters={toggleFilters}
      />

      {/* قسم الفلترة والبحث */}
      <AdminsFilter
        filters={filters}
        handleFilterChange={handleFilterChange}
        resetFilters={resetFilters}
        showFilters={showFilters}
      />

      {loading ? (
        <Loader />
      ) : admins.length === 0 ? (
        <div className={styles.noAdmins}>
          <p>لا يوجد مسؤولين حالياً</p>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className={styles.noResults}>
          <p>لا توجد نتائج مطابقة للبحث</p>
        </div>
      ) : (
        <div className={styles.adminsTableContainer}>
          <h2>قائمة المسؤولين</h2>
          {/* جدول للشاشات الكبيرة */}
          <AdminsTable
            admins={filteredAdmins}
            getRoleBadgeClass={getRoleBadgeClass}
            getStatusBadgeClass={getStatusBadgeClass}
            getRoleTranslation={getRoleTranslation}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
            canEdit={canEdit}
            isViewer={isViewer}
          />

          {/* بطاقات للشاشات الصغيرة */}
          <AdminCards
            admins={filteredAdmins}
            getRoleBadgeClass={getRoleBadgeClass}
            getStatusBadgeClass={getStatusBadgeClass}
            getRoleTranslation={getRoleTranslation}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
            canEdit={canEdit}
            isViewer={isViewer}
          />
        </div>
      )}

      {/* نموذج إضافة/تعديل المسؤولين */}
      {showModal && (
        <AdminForm
          editMode={editMode}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
          submitting={submitting}
          error={error}
          currentAdmin={currentAdmin}
        />
      )}
    </div>
  );
};

export default AdminsManagement;
