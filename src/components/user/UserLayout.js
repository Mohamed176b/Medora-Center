import React, { useMemo, useEffect, useState, useCallback, memo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import "../../style/UserLayout.css";
import useToast from "../../hooks/useToast";
import { signOutUser } from "../../supabase/authUtils";
import { clearUser } from "../../redux/slices/userSlice";
import Footer from "../common/Footer";
const UserLayout = memo(function UserLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNav, setActiveNav] = useState(location.pathname);
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const navLinks = useMemo(
    () => [
      {
        path: "/profile",
        icon: "fa-user",
        label: "الملف الشخصي",
      },
      {
        path: "/profile/appointments",
        icon: "fa-calendar-alt",
        label: "الحجوزات",
      },
      {
        path: "/profile/interactions",
        icon: "fa-comment",
        label: "نشاطاتي",
      },
    ],
    []
  );
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [location.key]);
  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOutUser();
      if (result.success) {
        dispatch(clearUser());
        toast("تم تسجيل الخروج بنجاح", "success");
        navigate("/");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الخروج", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الخروج", "error");
      // console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const onNavClick = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  useEffect(() => {
    setActiveNav(location.pathname);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="user-layout-container">
        <div className="user-layout-navbar">
          <button
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </button>

          <div
            className={`user-layout-links ${
              mobileMenuOpen ? "mobile-open" : ""
            }`}
          >
            <ul>
              {navLinks.map((link) => (
                <li
                  key={link.path}
                  onClick={() => onNavClick(link.path)}
                  className={activeNav === link.path ? "active" : ""}
                >
                  <i className={`fas ${link.icon} nav-icon`}></i>
                  <span>{link.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="user-layout-actions">
            <div
              className="logo"
              onClick={() => navigate("/")}
              title="الرجوع إلى الرئيسية"
            >
              <img
                src={process.env.PUBLIC_URL + "/logo.png"}
                alt="logo"
                loading="lazy"
              />
            </div>
            <button
              className="user-layout-action-button"
              onClick={handleLogout}
            >
              <i className="fa-solid fa-sign-out-alt"></i>
              <span>
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </span>
            </button>
          </div>
        </div>
        <div className="user-layout-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </>
  );
});

export default UserLayout;
