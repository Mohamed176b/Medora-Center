import "../../style/Login.css";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  signInUser,
  signInWithGoogle,
  resetPassword,
  handleGoogleRedirect,
  signInAdmin,
} from "../../supabase/authUtils";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { setAdmin } from "../../redux/slices/adminSlice";
import useToast from "../../hooks/useToast";

const Login = () => {
  const [activeTab, setActiveTab] = useState("user");
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const [userFormData, setUserFormData] = useState({
    email: "",
    password: "",
  });
  const [adminFormData, setAdminFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const location = useLocation();

  const switchTab = useCallback(
    (tab) => {
      setActiveTab(tab);
      const position = tab === "user" ? 0 : 50;
      setIndicatorStyle({
        left: `${position}%`,
        width: "50%",
      });
    },
    [setActiveTab, setIndicatorStyle]
  );

  useEffect(() => {
    switchTab(activeTab);
  }, [activeTab, switchTab]);

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const query = new URLSearchParams(location.search);
      const isGoogleProvider = query.get("provider") === "google";
      const tabParam = query.get("tab");

      if (tabParam === "admin" && activeTab !== "admin") {
        switchTab("admin");
      }

      if (isGoogleProvider) {
        setLoading(true);
        try {
          const result = await handleGoogleRedirect();

          if (result.success) {
            dispatch(
              setUser({
                id: result.user.id,
                email: result.user.email,
                name: result.profile?.full_name || "",
              })
            );

            toast("تم تسجيل الدخول بنجاح", "success");
            navigate("/profile");
          } else {
            toast(
              result.error || "حدث خطأ أثناء تسجيل الدخول مع Google",
              "error"
            );
          }
        } catch (error) {
          toast("حدث خطأ أثناء تسجيل الدخول مع Google", "error");
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleGoogleAuth();
  }, [location, navigate, dispatch, toast, switchTab, activeTab]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleResetEmailChange = (e) => {
    setResetEmail(e.target.value);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle("login");

      if (!result.success) {
        toast(
          result.error || "حدث خطأ أثناء تسجيل الدخول باستخدام Google",
          "error"
        );
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الدخول باستخدام Google", "error");
      console.error(error);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      toast("يرجى إدخال البريد الإلكتروني", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      toast("البريد الإلكتروني غير صالح", "error");
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        toast(result.message, "success");
        setShowForgotPassword(false);
      } else {
        toast(
          result.error || "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
          "error"
        );
      }
    } catch (error) {
      toast("حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور", "error");
      console.error(error);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (!userFormData.email || !userFormData.password) {
      toast("جميع الحقول مطلوبة", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await signInUser(
        userFormData.email,
        userFormData.password
      );

      if (result.success) {
        dispatch(
          setUser({
            id: result.user.id,
            email: userFormData.email,
            name: result.profile?.full_name || "",
          })
        );

        toast("تم تسجيل الدخول بنجاح", "success");
        navigate("/profile");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الدخول", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الدخول", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    if (!adminFormData.email || !adminFormData.password) {
      toast("جميع الحقول مطلوبة", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await signInAdmin(
        adminFormData.email,
        adminFormData.password
      );

      if (result.success) {
        if (!result.admin.is_active) {
          toast(
            "حسابك غير نشط. يرجى التواصل مع المسؤول العام.",
            "error"
          );
          return;
        }

        dispatch(
          setAdmin({
            id: result.user.id,
            email: adminFormData.email,
            admin: result.admin,
          })
        );

        toast("تم تسجيل الدخول بنجاح", "success");
        navigate("/admin");
      } else {
        toast(result.error || "حدث خطأ أثناء تسجيل الدخول", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تسجيل الدخول", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        {!showForgotPassword ? (
          <>
            <div className="login-tabs">
              <button
                className={`login-tab ${activeTab === "user" ? "active" : ""}`}
                onClick={() => switchTab("user")}
              >
                تسجيل دخول المستخدم
              </button>
              <button
                className={`login-tab ${activeTab === "admin" ? "active" : ""}`}
                onClick={() => switchTab("admin")}
              >
                تسجيل دخول المسؤول
              </button>
              <div className="tab-indicator" style={indicatorStyle}></div>
            </div>

            <div className="tab-content-container">
              {activeTab === "user" ? (
                // User Login Form
                <div className="tab-content user-tab">
                  <h2>تسجيل الدخول</h2>
                  <form onSubmit={handleUserSubmit}>
                    <div className="form-group">
                      <label htmlFor="userEmail">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        id="userEmail"
                        value={userFormData.email}
                        onChange={handleUserChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="userPassword">كلمة المرور</label>
                      <input
                        type="password"
                        name="password"
                        id="userPassword"
                        value={userFormData.password}
                        onChange={handleUserChange}
                        required
                      />
                    </div>
                    <p
                      className="forgot-password"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      نسيت كلمة المرور؟
                    </p>
                    <button type="submit" disabled={loading}>
                      {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </button>
                  </form>
                  <div className="social-login-container">
                    <p>أو سجل الدخول باستخدام</p>
                    <div className="social-login">
                      <button onClick={handleGoogleSignIn}>
                        <i className="fab fa-google"></i>
                      </button>
                    </div>
                  </div>
                  <p className="register-link">
                    ليس لديك حساب؟ <Link to="/register">تسجيل حساب جديد</Link>
                  </p>
                </div>
              ) : (
                // Admin Login Form
                <div className="tab-content admin-tab">
                  <h2>تسجيل الدخول كمسؤول</h2>
                  <form onSubmit={handleAdminSubmit}>
                    <div className="form-group">
                      <label htmlFor="adminEmail">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="email"
                        id="adminEmail"
                        value={adminFormData.email}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="adminPassword">كلمة المرور</label>
                      <input
                        type="password"
                        name="password"
                        id="adminPassword"
                        value={adminFormData.password}
                        onChange={handleAdminChange}
                        required
                      />
                    </div>
                    <button type="submit" disabled={loading}>
                      {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2>استعادة كلمة المرور</h2>
            <p className="reset-info">
              أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label htmlFor="resetEmail">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="resetEmail"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={handleResetEmailChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={isResettingPassword}>
                  {isResettingPassword
                    ? "جاري الإرسال..."
                    : "إرسال رابط إعادة التعيين"}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForgotPassword(false)}
                >
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
