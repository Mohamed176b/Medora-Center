import React, { useState, useEffect, useMemo, useCallback } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/AdminsManagement.module.css";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllAdminsData } from "../../../redux/slices/adminSlice";

import {
  // logDebugInfo,
  getRoleBadgeClass,
  getStatusBadgeClass,
  getRoleTranslation,
} from "../../../utils/adminHelpers";

const Loader = React.lazy(() => import("../../common/Loader"));
const AdminsHeader = React.lazy(() => import("./AdminsHeader"));
const AdminsFilter = React.lazy(() => import("./AdminsFilter"));
const AdminsTable = React.lazy(() => import("./AdminsTable"));
const AdminCards = React.lazy(() => import("./AdminCards"));
const AdminForm = React.lazy(() => import("./AdminForm"));

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

  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    searchQuery: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      if (isAuthorized) {
        dispatch(fetchAllAdminsData());
        // logDebugInfo("تم جلب المسؤولين بنجاح", { count: admins?.length });
      }
    } catch (error) {
      // console.error("Error fetching admins:", error.message);
      toast(`خطأ في جلب المسؤولين: ${error.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast, isAuthorized]); 

  useEffect(() => {
    if (!admins || admins.length === 0) {
      fetchAdmins();
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

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      role: "",
      isActive: "",
      searchQuery: "",
    });
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  const filteredAdmins = useMemo(() => {
    if (!Array.isArray(admins)) return [];

    return admins.filter((admin) => {
      if (filters.role && admin.role !== filters.role) {
        return false;
      }

      if (filters.isActive !== "") {
        const activeStatus = filters.isActive === "active";
        if (admin.is_active !== activeStatus) {
          return false;
        }
      }

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

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const openAddModal = useCallback(() => {
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
  }, []);

  const openEditModal = useCallback((admin) => {
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
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
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

          // logDebugInfo("تحديث المستخدم", {
          //   id: currentAdmin.id,
          //   role: formData.role,
          //   data: formData,
          // });

          const { data, error } = await supabase.rpc("update_admin_user", {
            admin_id: currentAdmin.id,
            admin_full_name: formData.full_name,
            admin_role: formData.role,
            admin_is_active: formData.is_active,
          });

          if (error) {
            // logDebugInfo("خطأ في التحديث", error);
            setError(`خطأ في تحديث المستخدم: ${error.message}`);
            setSubmitting(false);
            return;
          }

          if (data === false) {
            setError("فشلت عملية التحديث. تأكد من أن لديك الصلاحيات المناسبة.");
            setSubmitting(false);
            return;
          }

          toast("تم تحديث بيانات المستخدم بنجاح", "success");
        } else {
          // logDebugInfo("البحث عن مستخدم بالبريد", formData.email);

          const { data: userId, error: userIdError } = await supabase.rpc(
            "get_user_id_by_email",
            { email_input: formData.email }
          );

          if (userIdError || !userId) {
            // logDebugInfo("خطأ في البحث عن المستخدم", {
            //   error: userIdError,
            //   userId,
            // });
            setError(
              "لم يتم العثور على المستخدم في نظام المصادقة. يرجى التأكد من إنشاء الحساب أولاً."
            );
            setSubmitting(false);
            return;
          }

          const { data, error } = await supabase.rpc("add_admin_user", {
            admin_id: userId,
            admin_full_name: formData.full_name,
            admin_email: formData.email,
            admin_role: formData.role,
            admin_is_active: formData.is_active,
          });

          if (error) {
            // logDebugInfo("خطأ في إضافة المستخدم", error);

            if (error.code === "23505") {
              setError("هذا المستخدم موجود بالفعل في نظام إدارة المسؤولين");
            } else if (error.code === "22P02") {
              setError(
                "قيمة الدور غير صالحة. تأكد من استخدام قيمة صحيحة للدور."
              );
            } else {
              setError(
                `خطأ في إضافة المستخدم: ${error.message} (كود: ${error.code})`
              );
            }
            setSubmitting(false);
            return;
          }

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
        // console.error("Error handling admin:", error);
        toast(`حدث خطأ: ${error.message}`, "error");
      } finally {
        setSubmitting(false);
      }
    },
    [editMode, currentAdmin, formData, toast, fetchAdmins, closeModal]
  );

  const handleDelete = useCallback(
    async (adminId) => {
      const adminToDelete = admins.find((admin) => admin.id === adminId);
      if (adminToDelete && adminToDelete.role === "super-admin") {
        toast("لا يمكن حذف مستخدم بدور السوبر أدمن", "error");
        return;
      }

      const confirmResult = window.confirm(
        "هل أنت متأكد من حذف هذا المستخدم من نظام المسؤولين؟"
      );

      if (confirmResult) {
        const deleteAuthUser = window.confirm(
          "هل تريد أيضاً حذف المستخدم من نظام المصادقة؟ (هذا سيؤدي إلى حذف حسابه بالكامل وقد يؤثر على البيانات المرتبطة به)"
        );

        setSubmitting(true);
        try {
          // logDebugInfo("حذف المستخدم", { id: adminId, deleteAuthUser });

          const { data, error } = await supabase.rpc("delete_admin_user", {
            admin_id: adminId,
            delete_auth_user: deleteAuthUser,
          });

          if (error) {
            // logDebugInfo("خطأ في حذف المستخدم", error);
            toast(`خطأ في حذف المستخدم: ${error.message}`, "error");
            setSubmitting(false);
            return;
          }

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
    },
    [admins, toast, fetchAdmins]
  );

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (submitting) {
    return <Loader />;
  }

  return (
    <div className={styles.adminsManagement}>
      <AdminsHeader
        canEdit={canEdit}
        isViewer={isViewer}
        openAddModal={openAddModal}
        toggleFilters={toggleFilters}
      />

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

export default React.memo(AdminsManagement);
