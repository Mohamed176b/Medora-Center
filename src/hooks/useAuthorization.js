import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const useAuthorization = (allowedRoles, redirectPath = "/admin") => {
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
          marginTop: "20px auto",
        }}
      >
        غير مصرح لك بالدخول إلى هذه الصفحة. سيتم إعادة توجيهك...
      </div>
    )
  ) : null;

  return { isAuthorized, unauthorizedUI };
};

export default useAuthorization;
