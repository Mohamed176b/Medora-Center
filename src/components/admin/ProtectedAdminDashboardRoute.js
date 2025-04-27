import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkAdminSession } from "../../supabase/authUtils";
import { setAdmin } from "../../redux/slices/adminSlice";

const Loader = React.lazy(() => import("../common/Loader"));

const ProtectedAdminDashboardRoute = ({ children }) => {
  const { isAdminAuthenticated, admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const verifySession = async () => {
      if (!loading) return; // Prevent multiple verification attempts

      try {
        // Check if admin data exists in localStorage first
        const adminData = localStorage.getItem("admin");
        if (!adminData) {
          if (isMounted) {
            setSessionChecked(false);
            setLoading(false);
            navigate("/login");
          }
          return;
        }
        
        const result = await checkAdminSession();

        if (result.success && result.admin) {
          if (isMounted) {
            dispatch(
              setAdmin({
                id: result.user.id,
                email: result.user.email,
                admin: result.admin,
              })
            );
            setSessionChecked(true);
          }
        } else {
          if (isMounted) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Admin session verification error:", error);
        if (isMounted) {
          setError(error);
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (!isAdminAuthenticated || !admin) {
      verifySession();
    } else {
      setLoading(false);
      setSessionChecked(true);
    }
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [isAdminAuthenticated, admin, navigate, dispatch, loading]);

  if (error) {
    return (
      <div>Error verifying admin session. Please try logging in again.</div>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return sessionChecked ? children : <Loader />;
};

export default ProtectedAdminDashboardRoute;
