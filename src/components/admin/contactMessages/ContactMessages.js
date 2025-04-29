import React, { useState, useEffect, useMemo, useCallback } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import useToast from "../../../hooks/useToast";
import styles from "../../../style/ContactMessages.module.css";
import useAdminState from "../../../hooks/useAdminState";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllMessagesData,
  setAllMessagesData,
} from "../../../redux/slices/adminSlice";

const Loader = React.lazy(() => import("../../common/Loader"));
const FilterBar = React.lazy(() => import("./FilterBar"));
const MessageCard = React.lazy(() => import("./MessageCard"));

const ContactMessages = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.contactMessages
  );
  const admin = useAdminState();
  const canEdit = useMemo(() => {
    return (
      admin?.role === "super-admin" ||
      admin?.role === "admin" ||
      admin?.role === "moderator"
    );
  }, [admin?.role]);

  const dispatch = useDispatch();
  const messagesFromStore = useSelector(
    (state) => state.admin?.allMessagesData
  );
  const messages = useMemo(() => messagesFromStore || [], [messagesFromStore]);

  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUserType, setFilterUserType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchMessages = useCallback(() => {
    try {
      setLoading(true);
      dispatch(fetchAllMessagesData());
    } catch (error) {
      // console.error("Error fetching messages:", error);
      toast("حدث خطأ أثناء جلب الرسائل", "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if ((!messages || messages.length === 0) && isAuthorized) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [dispatch, isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReadStatusChange = useCallback(
    async (messageId, newStatus) => {
      try {
        const { error } = await supabase
          .from("messages")
          .update({ is_read: newStatus })
          .eq("id", messageId);

        if (error) throw error;

        const updatedMessages = messages.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: newStatus } : msg
        );
        dispatch(setAllMessagesData(updatedMessages));

        toast("تم تحديث حالة الرسالة بنجاح", "success");
      } catch (error) {
        // console.error("Error updating message status:", error);
        toast("حدث خطأ أثناء تحديث حالة الرسالة", "error");
      }
    },
    [messages, dispatch, toast]
  );

  const handleDelete = useCallback(
    async (messageId) => {
      if (!window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

      try {
        const { error } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageId);

        if (error) throw error;

        const updatedMessages = messages.filter((msg) => msg.id !== messageId);
        dispatch(setAllMessagesData(updatedMessages));

        toast("تم حذف الرسالة بنجاح", "success");
      } catch (error) {
        // console.error("Error deleting message:", error);
        toast("حدث خطأ أثناء حذف الرسالة", "error");
      }
    },
    [messages, dispatch, toast]
  );

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "read" && message.is_read) ||
        (filterStatus === "unread" && !message.is_read);

      const matchesUserType =
        filterUserType === "all" ||
        (filterUserType === "registered" && message.patients) ||
        (filterUserType === "guests" && !message.patients);

      const searchableContent = [
        message.subject,
        message.message,
        message.patients?.full_name || message.guest_name || "",
        message.patients?.email || message.guest_email || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchTerm === "" ||
        searchableContent.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesUserType && matchesSearch;
    });
  }, [messages, filterStatus, filterUserType, searchTerm]);

  const messageStats = useMemo(
    () => ({
      read: messages.filter((msg) => msg.is_read).length,
      unread: messages.filter((msg) => !msg.is_read).length,
      total: messages.length,
    }),
    [messages]
  );

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.messagesContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>الرسائل الواردة</h1>
        </div>
        <React.Suspense fallback={<Loader />}>
          <FilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterUserType={filterUserType}
            setFilterUserType={setFilterUserType}
          />
        </React.Suspense>
      </div>

      <div className={styles.statisticsBar}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope-open"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{messageStats.read}</span>
            <span className={styles.statLabel}>الرسائل المقروءة</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{messageStats.unread}</span>
            <span className={styles.statLabel}>الرسائل غير المقروءة</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope-square"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{messageStats.total}</span>
            <span className={styles.statLabel}>إجمالي الرسائل</span>
          </div>
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className={styles.noResults}>
          <i className="fas fa-inbox"></i>
          <p>لا توجد رسائل مطابقة للبحث</p>
        </div>
      ) : (
        <div className={styles.messagesList}>
          <React.Suspense fallback={<Loader />}>
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                canEdit={canEdit}
                onReadStatusChange={handleReadStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </React.Suspense>
        </div>
      )}
    </div>
  );
};

export default React.memo(ContactMessages);
