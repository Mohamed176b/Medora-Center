import React, { useState, useEffect } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import useToast from "../../../hooks/useToast";
import styles from "../../../style/ContactMessages.module.css";
import Loader from "../../common/Loader";
import useAdminState from "../../../hooks/useAdminState";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllMessagesData,
  setAllMessagesData,
} from "../../../redux/slices/adminSlice";
const ContactMessages = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.contactMessages
  );
  const admin = useAdminState();
  const canEdit =
    admin?.role === "super-admin" ||
    admin?.role === "admin" ||
    admin?.role === "moderator";
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.admin?.allMessagesData) || [];
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchMessages = () => {
    try {
      setLoading(true);
      dispatch(fetchAllMessagesData());
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast("حدث خطأ أثناء جلب الرسائل", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!messages || messages.length === 0) {
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  const handleReadStatusChange = async (messageId, newStatus) => {
    try {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: newStatus })
        .eq("id", messageId);

      if (error) throw error;

      // Update the messages in Redux store using action creator
      const updatedMessages = messages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: newStatus } : msg
      );
      dispatch(setAllMessagesData(updatedMessages));

      toast("تم تحديث حالة الرسالة بنجاح", "success");
    } catch (error) {
      console.error("Error updating message status:", error);
      toast("حدث خطأ أثناء تحديث حالة الرسالة", "error");
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الرسالة؟")) return;

    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      // Update Redux state after successful deletion
      const updatedMessages = messages.filter((msg) => msg.id !== messageId);
      dispatch(setAllMessagesData(updatedMessages));

      toast("تم حذف الرسالة بنجاح", "success");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast("حدث خطأ أثناء حذف الرسالة", "error");
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy - HH:mm", {
      locale: arEG,
    });
  };

  const filteredMessages = messages.filter((message) => {
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "read" && message.is_read) ||
      (filterStatus === "unread" && !message.is_read);

    const searchableContent = [
      message.subject,
      message.message,
      message.patients?.full_name || message.guest_name || "",
      message.patients?.email || message.guest_email || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchTerm === "" || searchableContent.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="البحث في الرسائل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">جميع الرسائل</option>
            <option value="read">الرسائل المقروءة</option>
            <option value="unread">الرسائل غير المقروءة</option>
          </select>
        </div>
      </div>

      <div className={styles.statisticsBar}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope-open"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {messages.filter((msg) => msg.is_read).length}
            </span>
            <span className={styles.statLabel}>الرسائل المقروءة</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {messages.filter((msg) => !msg.is_read).length}
            </span>
            <span className={styles.statLabel}>الرسائل غير المقروءة</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-envelope-square"></i>
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{messages.length}</span>
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
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageCard} ${
                !message.is_read ? styles.unread : ""
              }`}
            >
              <div className={styles.messageHeader}>
                <div className={styles.senderInfo}>
                  <h3>
                    {message.patients
                      ? message.patients.full_name
                      : message.guest_name || "زائر"}
                    {message.patients ? (
                      <span className={styles.userBadge}>مستخدم مسجل</span>
                    ) : (
                      <span className={styles.guestBadge}>زائر</span>
                    )}
                  </h3>
                  <span className={styles.senderEmail}>
                    {message.patients
                      ? message.patients.email
                      : message.guest_email || "غير متوفر"}
                  </span>
                </div>
                <div className={styles.messageDate}>
                  <i className="far fa-clock"></i>
                  {formatDate(message.sent_at)}
                </div>
              </div>

              <div className={styles.messageContent}>
                <div className={styles.messageSubject}>
                  <strong>الموضوع:</strong> {message.subject || "بدون موضوع"}
                </div>
                <p>{message.message}</p>
              </div>

              <div className={styles.messageFooter}>
                <div className={styles.statusSection}>
                  <span
                    className={`${styles.statusBadge} ${
                      message.is_read ? styles.read : styles.unread
                    }`}
                  >
                    {message.is_read ? "مقروءة" : "غير مقروءة"}
                  </span>
                  {canEdit && (
                    <button
                      className={styles.toggleStatusBtn}
                      onClick={() =>
                        handleReadStatusChange(message.id, !message.is_read)
                      }
                    >
                      {message.is_read ? "تعيين كغير مقروءة" : "تعيين كمقروءة"}
                    </button>
                  )}
                </div>
                {canEdit && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(message.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
