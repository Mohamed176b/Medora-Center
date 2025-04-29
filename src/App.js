import "./style/App.css";
import React, { Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/userSlice";
import { checkUserSession, checkAdminSession } from "./supabase/authUtils";
import { setAdmin } from "./redux/slices/adminSlice";
import UsersManagement from "./components/admin/usersManagement/UsersManagement";
import ErrorBoundary from "./components/common/ErrorBoundary";
import PrivacyPolicy from "./components/common/PrivacyPolicy";
import Terms from "./components/common/Terms";
import Sitemap from "./components/common/Sitemap";
import BlogCategory from "./components/site/blog/BlogCategory";
import ServiceDetail from "./components/site/services/ServiceDetail";

const Loader = React.lazy(() => import("./components/common/Loader"));
const Toast = React.lazy(() => import("./components/common/Toast"));
const Home = React.lazy(() => import("./components/site/home/Home"));
const AboutUs = React.lazy(() => import("./components/site/aboutUs/AboutUs"));
const Contact = React.lazy(() => import("./components/site/contact/Contact"));
const Services = React.lazy(() =>
  import("./components/site/services/Services")
);
const Blog = React.lazy(() => import("./components/site/blog/Blog"));
const BlogDetail = React.lazy(() =>
  import("./components/site/blog/BlogDetail")
);
const Doctors = React.lazy(() => import("./components/site/doctors/Doctors"));
const ProtectedUserDashboardRoute = React.lazy(() =>
  import("./components/user/ProtectedUserDashboardRoute")
);
const UserProfile = React.lazy(() => import("./components/user/UserProfile"));
const Login = React.lazy(() => import("./components/common/Login"));
const Register = React.lazy(() => import("./components/common/Register"));
const UpdatePassword = React.lazy(() =>
  import("./components/common/UpdatePassword")
);
const ProtectedAdminDashboardRoute = React.lazy(() =>
  import("./components/admin/ProtectedAdminDashboardRoute")
);
const NotFound = React.lazy(() => import("./components/common/NotFound"));
const Site = React.lazy(() => import("./components/site/Site"));
const Booking = React.lazy(() => import("./components/site/booking/Booking"));
const Appointments = React.lazy(() =>
  import("./components/admin/appoinements/Appointments")
);
const DoctorManagement = React.lazy(() =>
  import("./components/admin/doctorManagement/DoctorManagement")
);
const ServicesManagement = React.lazy(() =>
  import("./components/admin/servicesManagement/ServicesManagement")
);
const SiteSettings = React.lazy(() =>
  import("./components/admin/siteSettings/SiteSettings")
);
const BlogManagement = React.lazy(() =>
  import("./components/admin/blogManagement/BlogManagement")
);
const ContactMessages = React.lazy(() =>
  import("./components/admin/contactMessages/ContactMessages")
);
const AdminLayout = React.lazy(() => import("./components/admin/AdminLayout"));
const AdminHome = React.lazy(() => import("./components/admin/AdminHome"));
const Analytics = React.lazy(() =>
  import("./components/admin/analytics/Analytics")
);
const Testimonials = React.lazy(() =>
  import("./components/admin/testimonials/Testimonials")
);
const AdminsManagement = React.lazy(() =>
  import("./components/admin/adminsManagement/AdminsManagement")
);
const UserLayout = React.lazy(() => import("./components/user/UserLayout"));
const UserAppointments = React.lazy(() =>
  import("./components/user/UserAppointments")
);
const UserMessagesComments = React.lazy(() =>
  import("./components/user/UserMessagesComments")
);

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // أولوية: تحميل بيانات المستخدم من localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.is_active === true) {
        dispatch(setUser(parsedUser));
      } else {
        localStorage.removeItem("user");
      }
    }
    // ثم تحقق من الجلسة مع السيرفر (للتأكد من التزامن)
    const checkSession = async () => {
      try {
        if (localStorage.getItem("user")) {
          const userResult = await checkUserSession();
          if (
            userResult.success &&
            userResult.profile &&
            userResult.profile.is_active === true
          ) {
            dispatch(
              setUser({
                id: userResult.user.id,
                email: userResult.user.email,
                name: userResult.profile.full_name,
                phone: userResult.profile.phone,
                gender: userResult.profile.gender,
                date_of_birth: userResult.profile.date_of_birth,
                address: userResult.profile.address,
                is_active: userResult.profile.is_active,
                ...userResult.profile,
              })
            );
          } else if (
            userResult.profile &&
            userResult.profile.is_active === false
          ) {
            localStorage.removeItem("user");
          }
        }
        // Check if admin is logged in
        else if (localStorage.getItem("admin")) {
          const adminResult = await checkAdminSession();
          if (adminResult.success && adminResult.admin) {
            dispatch(
              setAdmin({
                id: adminResult.user.id,
                email: adminResult.user.email,
                admin: adminResult.admin,
              })
            );
          }
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <Toast />
        <Routes>
          <Route path="/" element={<Site />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route
              path="/blog/category/:categoryId"
              element={<BlogCategory />}
            />
            <Route path="/booking" element={<Booking />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/sitemap" element={<Sitemap />} />
          </Route>
          {/* Login & Register Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          {/* User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedUserDashboardRoute>
                <UserLayout />
              </ProtectedUserDashboardRoute>
            }
          >
            <Route index element={<UserProfile />} />
            <Route path="appointments" element={<UserAppointments />} />
            <Route path="interactions" element={<UserMessagesComments />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ErrorBoundary>
                <ProtectedAdminDashboardRoute>
                  <AdminLayout />
                </ProtectedAdminDashboardRoute>
              </ErrorBoundary>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctorsManagement" element={<DoctorManagement />} />
            <Route path="servicesManagement" element={<ServicesManagement />} />
            <Route path="siteSettings" element={<SiteSettings />} />
            <Route path="blogManagement" element={<BlogManagement />} />
            <Route path="contactMessages" element={<ContactMessages />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="adminsManagement" element={<AdminsManagement />} />
            <Route path="usersManagement" element={<UsersManagement />} />
          </Route>
          {/* Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
