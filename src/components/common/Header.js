import React, { useMemo, useCallback, useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../../redux/slices/userSlice";
import { clearAdmin } from "../../redux/slices/adminSlice";
import { signOutUser, signOutAdmin } from "../../supabase/authUtils";
import useToast from "../../hooks/useToast";
import "../../style/Header.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { isAdminAuthenticated, admin } = useSelector((state) => state.admin);

  const handleNavigation = useCallback(
    (path) => {
      setMobileMenuOpen(false);
      navigate(path);
    },
    [navigate]
  );
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.key]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleUserLogout = async () => {
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
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAdminLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOutAdmin();
      if (result.success) {
        dispatch(clearAdmin());
        toast("تم تسجيل الخروج بنجاح", "success");
        navigate("/");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الخروج", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الخروج", "error");
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const headerLinks = useMemo(
    () => [
      { path: "/", icon: "fa-house", label: "الرئيسية" },
      { path: "/about", icon: "fa-address-card", label: "من نحن" },
      {
        path: "/services",
        icon: "fa-diagram-project",
        label: "الخدمات",
      },
      {
        path: "/doctors",
        icon: "fa-user-doctor",
        label: "الأطباء",
      },
      {
        path: "/contact",
        icon: "fa-envelope",
        label: "تواصل معنا",
      },
      { path: "/booking", icon: "fa-calendar", label: "الحجوزات" },
      {
        path: "/blog",
        icon: "fa-blog",
        label: "المدونة",
        checkStartsWith: true,
      },
    ],
    []
  );

  return (
    <div className="header">
      <div className="container">
        {/* Header Links */}
        <div className="header-content">
          <div className="logo" onClick={() => handleNavigation("/")}>
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="Medora Center Logo"
              loading="lazy"
            />
            <h1 className="logo-text">Medora Center</h1>
          </div>
          <div
            className={`header-links ${mobileMenuOpen ? "mobile-open" : ""}`}
          >
            <ul>
              {headerLinks.map((link) => {
                const isActive = link.checkStartsWith
                  ? location.pathname.startsWith(link.path)
                  : location.pathname === link.path;

                return (
                  <Link to={link.path} key={link.path}>
                    <li
                      key={link.path}
                      className={`nav ${isActive ? "active" : ""}`}
                    >
                      <i className={`fa ${link.icon}`}></i>
                      <span>{link.label}</span>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </div>
          <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <i className={`fa ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
          </div>
        </div>
        {/* Check if admin is authenticated */}
        {isAdminAuthenticated && admin ? (
          <div className="user-actions">
            <button className="profile-btn" onClick={() => navigate("/admin")}>
              <i className="fa fa-user-shield"></i>
              <span>لوحة التحكم</span>
            </button>
            <button
              className="logout-btn"
              onClick={handleAdminLogout}
              disabled={isLoggingOut}
            >
              <i className="fa fa-sign-out-alt"></i>
              <span>{isLoggingOut ? "جاري..." : "تسجيل الخروج"}</span>
            </button>
          </div>
        ) : isAuthenticated && user ? (
          <div className="user-actions">
            <button
              className="profile-btn"
              onClick={() => navigate("/profile")}
            >
              <i className="fa fa-user"></i>
              <span>{user.name || "الملف الشخصي"}</span>
            </button>
            <button
              className="logout-btn"
              onClick={handleUserLogout}
              disabled={isLoggingOut}
            >
              <i className="fa fa-sign-out-alt"></i>
              <span>{isLoggingOut ? "جاري..." : "تسجيل الخروج"}</span>
            </button>
          </div>
        ) : (
          <div className="login-register-container">
            <div className="login-register">
              <button className="login-btn" onClick={() => navigate("/login")}>
                تسجيل الدخول
              </button>
              <button
                className="register-btn"
                onClick={() => navigate("/register")}
              >
                لا يوجد حساب؟
              </button>
            </div>
            <i
              className="fa-solid fa-right-to-bracket login-register-icon"
              onClick={() => navigate("/login")}
            ></i>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Header);
