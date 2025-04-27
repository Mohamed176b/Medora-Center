import "../../style/AdminDashboard.css";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutAdmin } from "../../supabase/authUtils";
import { clearAdmin } from "../../redux/slices/adminSlice";
import useToast from "../../hooks/useToast";
import { PAGE_ROLES } from "../../config/roles";

const AdminLayout = () => {
  // Fix destructuring to handle potential null state during logout
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
      // Get the current URL path
      const currentPath = window.location.pathname;

      // Check if we're in blog management AND the form is open
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

      // If not in blog management or no form is open, navigate directly
      setActiveNav(path);
      navigate(path);
      setIsSidebarOpen(false);
    },
    [navigate]
  );
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location.key]);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSignOut = async () => {
    try {
      // First clear the Redux state to prevent rendering issues
      dispatch(clearAdmin());

      // Then remove from localStorage
      localStorage.removeItem("admin");

      // Finally perform the Supabase signout - do this after Redux state has been cleared
      const result = await signOutAdmin();

      if (result.success) {
        toast("تم تسجيل الخروج بنجاح", "success");

        navigate("/");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الخروج", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الخروج", "error");
      console.error(error);
    }
  };

  useEffect(() => {
    setActiveNav(location.pathname);
  }, [location.pathname]);

  const handleOverlayClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-dashboard-layout">
      {/* Mobile toggle button */}
      <div className="mobile-toggle" onClick={toggleSidebar}>
        <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"}`}></i>
      </div>

      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={handleOverlayClick}
      ></div>

      {/* Sidebar */}
      <nav className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo" onClick={() => handleNavigation("/")}>
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="logo"
              loading="lazy"
            />
          </div>
          <h2>لوحة التحكم</h2>
        </div>
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
};

export default AdminLayout;
