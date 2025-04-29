import React, { memo } from "react";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import styles from "../../../style/ContactMessages.module.css";

const MessageCard = memo(
  ({ message, canEdit, onReadStatusChange, onDelete }) => {
    const formatDate = (dateString) => {
      return format(new Date(dateString), "dd MMMM yyyy - HH:mm", {
        locale: arEG,
      });
    };

    return (
      <div
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
                onClick={() => onReadStatusChange(message.id, !message.is_read)}
              >
                {message.is_read ? "تعيين كغير مقروءة" : "تعيين كمقروءة"}
              </button>
            )}
          </div>
          {canEdit && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(message.id)}
            >
              <i className="fas fa-trash-alt"></i>
              حذف
            </button>
          )}
        </div>
      </div>
    );
  }
);

MessageCard.displayName = "MessageCard";

export default MessageCard;
