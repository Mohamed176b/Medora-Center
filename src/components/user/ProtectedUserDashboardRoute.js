import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkUserSession } from "../../supabase/authUtils";
import { setUser } from "../../redux/slices/userSlice";
const Loader = React.lazy(() => import("../common/Loader"));

const ProtectedUserDashboardRoute = memo(function ProtectedUserDashboardRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { isAdminAuthenticated, admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState(null);
  const memoizedNavigate = useCallback((path) => navigate(path), [navigate]);
  const memoizedDispatch = useCallback((action) => dispatch(action), [dispatch]);

  useEffect(() => {
    if (isAdminAuthenticated && admin) {
      memoizedNavigate("/admin");
      return;
    }

    const verifySession = async () => {
      if (!loading) return;

      try {
        const adminData = localStorage.getItem("admin");
        if (adminData) {
          memoizedNavigate("/admin");
          return;
        }

        const result = await checkUserSession();

        if (result.success && result.profile && result.profile.is_active === true) {
          memoizedDispatch(
            setUser({
              id: result.user.id,
              email: result.user.email,
              name: result.profile.full_name,
              is_active: result.profile.is_active,
              ...result.profile,
            })
          );
          setSessionChecked(true);
        } else if (result.profile && result.profile.is_active === false) {
          setError('حسابك غير نشط. يرجى التواصل مع الدعم.');
          memoizedNavigate("/login");
        } else {
          memoizedNavigate("/login");
        }
      } catch (error) {
        // console.error("Session verification error:", error);
        setError(error);
        memoizedNavigate("/login");
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated || !user) {
      verifySession();
    } else {
      setLoading(false);
      setSessionChecked(true);
    }
  }, [
    isAuthenticated,
    user,
    isAdminAuthenticated,
    admin,
    navigate,
    dispatch,
    loading,
  ]);

  if (error) {
    return <div>Error verifying session. Please try logging in again.</div>;
  }

  if (loading) {
    return <Loader />;
  }

  return sessionChecked ? children : <Loader />;
});
export default ProtectedUserDashboardRoute;
