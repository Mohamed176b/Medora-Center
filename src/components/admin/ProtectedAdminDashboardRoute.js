import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAdminSession } from "../../supabase/authUtils";
import { setAdmin } from "../../redux/slices/adminSlice";

const Loader = React.lazy(() => import("../common/Loader"));

const ProtectedAdminDashboardRoute = React.memo(({ children }) => {
  const { isAdminAuthenticated, admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState(null);

  const verifySession = useCallback(async () => {
    if (!loading) return;

    try {
      const adminData = localStorage.getItem("admin");
      if (!adminData) {
        setSessionChecked(false);
        setLoading(false);
        navigate("/login");
        return;
      }

      const result = await checkAdminSession();

      if (result.success && result.admin) {
        dispatch(
          setAdmin({
            id: result.user.id,
            email: result.user.email,
            admin: result.admin,
          })
        );
        setSessionChecked(true);
      } else {
        navigate("/login");
      }
    } catch (error) {
      // console.error("Admin session verification error:", error);
      setError(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [loading, navigate, dispatch]);

  useEffect(() => {
    let isMounted = true;

    if (!isAdminAuthenticated || !admin) {
      verifySession();
    } else {
      if (isMounted) {
        setLoading(false);
        setSessionChecked(true);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [isAdminAuthenticated, admin, verifySession]);

  const errorComponent = useMemo(() => {
    if (error) {
      return (
        <div>Error verifying admin session. Please try logging in again.</div>
      );
    }
    return null;
  }, [error]);

  const loadingComponent = useMemo(() => <Loader />, []);

  if (error) {
    return errorComponent;
  }

  if (loading) {
    return loadingComponent;
  }

  return sessionChecked ? children : loadingComponent;
});

ProtectedAdminDashboardRoute.displayName = "ProtectedAdminDashboardRoute";

export default ProtectedAdminDashboardRoute;
