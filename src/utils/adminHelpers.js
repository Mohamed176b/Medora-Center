import styles from '../style/AdminsManagement.module.css';

// وظيفة مساعدة لطباعة معلومات تصحيح الأخطاء
export const logDebugInfo = (title, data) => {
  console.log(`DEBUG - ${title}:`, data);
};

// الحصول على فئة الشارة المناسبة حسب الدور
export const getRoleBadgeClass = (role) => {
  switch (role) {
    case "super-admin":
      return styles.superAdmin;
    case "admin":
      return styles.admin;
    case "editor":
      return styles.editor;
    case "moderator":
      return styles.moderator;
    case "viewer":
      return styles.viewer;
    default:
      return "";
  }
};

// الحصول على فئة الشارة المناسبة حسب حالة النشاط
export const getStatusBadgeClass = (isActive) => {
  return isActive ? styles.active : styles.inactive;
};

// ترجمة الدور إلى اللغة العربية
export const getRoleTranslation = (role) => {
  switch (role) {
    case "super-admin":
      return "مسؤول عام";
    case "admin":
      return "مسؤول";
    case "editor":
      return "محرر";
    case "moderator":
      return "مشرف";
    case "viewer":
      return "مشاهد";
    default:
      return role;
  }
}; 