import styles from "../style/AdminsManagement.module.css";

export const logDebugInfo = (title, data) => {
  console.log(`DEBUG - ${title}:`, data);
};

const ROLE_BADGE_CLASSES = {
  "super-admin": styles.superAdmin,
  admin: styles.admin,
  editor: styles.editor,
  moderator: styles.moderator,
  viewer: styles.viewer,
};

const ROLE_TRANSLATIONS = {
  "super-admin": "مسؤول عام",
  admin: "مسؤول",
  editor: "محرر",
  moderator: "مشرف",
  viewer: "مشاهد",
};

export const getRoleBadgeClass = (role) => {
  return ROLE_BADGE_CLASSES[role] || "";
};

export const getStatusBadgeClass = (isActive) => {
  return isActive ? styles.active : styles.inactive;
};

export const getRoleTranslation = (role) => {
  return ROLE_TRANSLATIONS[role] || role;
};
