import "../../style/AdminDashboard.css";
import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutAdmin } from "../../supabase/authUtils";
import { clearAdmin } from "../../redux/slices/adminSlice";
import useToast from "../../hooks/useToast";
import { PAGE_ROLES } from "../../config/roles";

const AdminLayout = memo(() => {
  const adminState = useSelector((state) => state.admin);
  const admin = adminState?.admin?.admin || { role: [] };

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = useMemo(
    () => [
      {
        path: "/admin",
        icon: "fa-tachometer-alt",
        label: "الرئيسية",
        roles: PAGE_ROLES.dashboard,
      },
      {
        path: "/admin/adminsManagement",
        icon: "fa-user-shield",
        label: "إدارة المسؤولين",
        roles: PAGE_ROLES.adminsManagement,
      },
      {
        path: "/admin/usersManagement",
        icon: "fa-user-friends",
        label: "إدارة المستخدمين",
        roles: PAGE_ROLES.usersManagement,
      },
      {
        path: "/admin/appointments",
        icon: "fa-calendar-alt",
        label: "الحجوزات",
        roles: PAGE_ROLES.appointments,
      },
      {
        path: "/admin/doctorsManagement",
        icon: "fa-user-md",
        label: "الأطباء",
        roles: PAGE_ROLES.doctorsManagement,
      },
      {
        path: "/admin/servicesManagement",
        icon: "fa-list-alt",
        label: "الخدمات",
        roles: PAGE_ROLES.servicesManagement,
      },
      {
        path: "/admin/contactMessages",
        icon: "fa-envelope",
        label: "الرسائل",
        roles: PAGE_ROLES.contactMessages,
      },
      {
        path: "/admin/testimonials",
        icon: "fa-comment-dots",
        label: "التقييمات",
        roles: PAGE_ROLES.testimonials,
      },
      {
        path: "/admin/analytics",
        icon: "fa-chart-bar",
        label: "التحليلات",
        roles: PAGE_ROLES.analytics,
      },
      {
        path: "/admin/blogManagement",
        icon: "fa-blog",
        label: "المدونة",
        roles: PAGE_ROLES.blogManagement,
      },
      {
        path: "/admin/siteSettings",
        icon: "fa-cog",
        label: "الإعدادات",
        roles: PAGE_ROLES.siteSettings,
      },
      {
        path: "/",
        icon: "fa-home",
        label: "الموقع",
        roles: PAGE_ROLES.home,
      },
    ],
    []
  );

  const handleNavigation = useCallback(
    (path) => {
      const currentPath = window.location.pathname;
      const blogManagementFormElement = document.querySelector(".blog-form");
      if (
        currentPath.includes("/admin/blogManagement") &&
        blogManagementFormElement
      ) {
        const event = new CustomEvent("checkUnsavedChanges", {
          detail: {
            onContinue: () => {
              setActiveNav(path);
              navigate(path);
              setIsSidebarOpen(false);
            },
          },
        });
        window.dispatchEvent(event);
        return;
      }

      setActiveNav(path);
      navigate(path);
      setIsSidebarOpen(false);
    },
    [navigate]
  );

  const handleSignOut = useCallback(async () => {
    try {
      const result = await signOutAdmin();

      if (result.success) {
        toast("تم تسجيل الخروج بنجاح", "success");
        navigate("/");
        dispatch(clearAdmin());
        localStorage.removeItem("admin");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الخروج", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الخروج", "error");
      // console.error(error);
    }
  }, [dispatch, navigate, toast]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleOverlayClick = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.key]);

  useEffect(() => {
    setActiveNav(location.pathname);
  }, [location.pathname]);

  const memoizedLogo = useMemo(
    () => (
      <div className="logo" onClick={() => handleNavigation("/")}>
        <img
          src={`${process.env.PUBLIC_URL}/logo.png`}
          alt="logo"
          loading="lazy"
        />
      </div>
    ),
    [handleNavigation]
  );

  const memoizedNavLinks = useMemo(
    () => (
      <ul>
        {navLinks.map((link) => (
          <li
            key={link.path}
            onClick={() =>
              link.roles.includes(admin.role)
                ? handleNavigation(link.path)
                : null
            }
            className={activeNav === link.path ? "active" : ""}
            style={{
              display: link.roles.includes(admin.role) ? "block" : "none",
              cursor: link.roles.includes(admin.role) ? "pointer" : "default",
            }}
          >
            <i className={`fas ${link.icon} nav-icon`}></i>
            <span>{link.label}</span>
          </li>
        ))}
      </ul>
    ),
    [navLinks, admin.role, activeNav, handleNavigation]
  );

  return (
    <div className="admin-dashboard-layout">
      <div className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"}`}></i>
      </div>
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={handleOverlayClick}
      ></div>
      <nav className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          {memoizedLogo}
          <h2>لوحة التحكم</h2>
        </div>
        {memoizedNavLinks}
        <button className="sign-out-button" onClick={handleSignOut}>
          <i className="fas fa-sign-out-alt ml-2"></i> تسجيل الخروج
        </button>
      </nav>
      <main className="admin-main">
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
});

AdminLayout.displayName = "AdminLayout";

export default AdminLayout;
