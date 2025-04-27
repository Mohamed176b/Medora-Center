import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Hook مخصص للتحقق من صلاحيات المستخدم
 * @param {Array} allowedRoles - الأدوار المسموح لها بالوصول
 * @param {string} redirectPath - مسار إعادة التوجيه في حالة عدم التصريح، الافتراضي "/admin"
 * @returns {Object} نتيجة التحقق من التصريح وواجهة المستخدم إذا لم يكن مصرحًا
 */
const useAuthorization = (allowedRoles, redirectPath = "/admin") => {
  // Fix destructuring to handle potential null state during logout
  const adminState = useSelector((state) => state.admin);
  const admin = adminState?.admin?.admin;

  const [redirect, setRedirect] = useState(false);

  const isAuthorized = admin && allowedRoles.includes(admin.role);

  useEffect(() => {
    if (!isAuthorized) {
      const timer = setTimeout(() => {
        setRedirect(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthorized]);

  // واجهة المستخدم لعرض رسالة عدم التصريح
  const unauthorizedUI = !isAuthorized ? (
    redirect ? (
      <Navigate to={redirectPath} />
    ) : (
      <div
        className="unauthorized-message"
        style={{
          padding: "20px",
          textAlign: "center",
          color: "red",
          fontWeight: "bold",
        }}
      >
        غير مصرح لك بالدخول إلى هذه الصفحة. سيتم إعادة توجيهك...
      </div>
    )
  ) : null;

  return { isAuthorized, unauthorizedUI };
};

export default useAuthorization;
