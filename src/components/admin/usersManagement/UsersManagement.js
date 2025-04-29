import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import useToast from "../../../hooks/useToast";
import useAdminState from "../../../hooks/useAdminState";
import styles from "../../../style/UsersManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllUsersData,
  setAllUsersData,
} from "../../../redux/slices/adminSlice";

const Loader = React.lazy(() => import("../../common/Loader"));

const UserCard = memo(({ user, canEdit, onToggleStatus }) => {
  return (
    <div className={styles.userCard}>
      <div className={styles.userInfo}>
        <h3>{user.full_name}</h3>
        <div className={styles.userDetails}>
          <div className={styles.detailItem}>
            <span>البريد:</span>
            <span>{user.email}</span>
          </div>
          <div className={styles.detailItem}>
            <span>الهاتف:</span>
            <span>{user.phone || "غير متوفر"}</span>
          </div>
          <div className={styles.detailItem}>
            <span>الجنس:</span>
            <span>
              {user.gender === "male"
                ? "ذكر"
                : user.gender === "female"
                ? "أنثى"
                : "غير محدد"}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span>العنوان:</span>
            <span>{user.address || "غير متوفر"}</span>
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span>{user.messages[0]?.count || 0}</span>
            <label>الرسائل</label>
          </div>
          <div className={styles.statItem}>
            <span>{user.testimonials[0]?.count || 0}</span>
            <label>التقييمات</label>
          </div>
          <div className={styles.statItem}>
            <span>{user.appointments[0]?.count || 0}</span>
            <label>المواعيد</label>
          </div>
        </div>

        {canEdit && (
          <div className={styles.actions}>
            <button
              className={`${styles.toggleButton} ${
                user.is_active ? styles.active : styles.inactive
              }`}
              onClick={() => onToggleStatus(user.id, user.is_active)}
            >
              {user.is_active ? "إيقاف النشاط" : "تفعيل"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

UserCard.displayName = "UserCard";

const UsersManagement = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.usersManagement
  );
  const admin = useAdminState();
  const canEdit = admin?.role === "super-admin";
  const [loading, setLoading] = useState(true);
  const users = useSelector((state) => state.admin.allUsersData);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchUsers = useCallback(() => {
    try {
      if (isAuthorized) {
        dispatch(fetchAllUsersData());
      }
    } catch (error) {
      toast("خطأ في جلب بيانات المستخدمين", "error");
      // console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast, isAuthorized]);

  useEffect(() => {
    if (!users || users.length === 0) {
      setLoading(true);
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [fetchUsers, users]);

  const toggleUserStatus = useCallback(
    async (userId, currentStatus) => {
      try {
        const { error } = await supabase
          .from("patients")
          .update({ is_active: !currentStatus })
          .eq("id", userId);

        if (error) throw error;

        const updatedUsers = users.map((user) =>
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        );
        dispatch(setAllUsersData(updatedUsers));

        toast(
          `تم ${!currentStatus ? "تفعيل" : "إيقاف"} حساب المستخدم بنجاح`,
          "success"
        );
      } catch (error) {
        toast("خطأ في تحديث حالة المستخدم", "error");
        // console.error("Error toggling user status:", error);
      }
    },
    [users, dispatch, toast]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [users, searchTerm]
  );

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>إدارة المستخدمين</h2>
      </div>

      <input
        type="text"
        placeholder="البحث عن مستخدم..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className={styles.usersGrid}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              canEdit={canEdit}
              onToggleStatus={toggleUserStatus}
            />
          ))
        ) : (
          <div className={styles.noUsers}>لا يوجد مستخدمين مطابقين لبحثك</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UsersManagement);
