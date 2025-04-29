import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updatePassword } from "../../supabase/authUtils";
import { supabase } from "../../supabase/supabaseClient";
import useToast from "../../hooks/useToast";
import "../../style/UpdatePassword.css";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [, setUser] = React.useState(null);

  React.useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
      else setUser(null);
    } catch {
      setUser(null);
    }
  }, []);

  let supabaseProvider = null;
  for (let key in localStorage) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const session = JSON.parse(localStorage.getItem(key));
        supabaseProvider = session?.user?.app_metadata?.provider;
      } catch {}
      break;
    }
  }

  React.useEffect(() => {
    if (supabaseProvider === "google") {
      navigate("/", { replace: true });
    }
  }, [supabaseProvider, navigate]);


  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "newPassword") {
      validatePassword(value);
    }
  }, []);

  const toggleTooltip = React.useCallback(() => {
    setShowTooltip((prev) => !prev);
  }, []);


  if (supabaseProvider === "google") {
    return null;
  }
  let accessToken = null;
  let refreshToken = null;
  for (let key in localStorage) {
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const session = JSON.parse(localStorage.getItem(key));
        accessToken = session?.access_token;
        refreshToken = session?.refresh_token;
      } catch (e) {}
      break;
    }
  }

  const validatePassword = (password) => {
    const errors = {
      length: password.length < 8,
      uppercase: !/[A-Z]/.test(password),
      lowercase: !/[a-z]/.test(password),
      number: !/[0-9]/.test(password),
    };

    setPasswordErrors(errors);

    return !Object.values(errors).some((error) => error);
  };

 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accessToken) {
      toast("رابط إعادة تعيين كلمة المرور غير صالح أو مفقود.", "error");
      return;
    }

    const isPasswordValid = validatePassword(passwordData.newPassword);
    if (!isPasswordValid) {
      toast("كلمة المرور لا تطابق المعايير المطلوبة", "warning");
      setShowTooltip(true);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast("كلمات المرور غير متطابقة", "warning");
      return;
    }

    setIsUpdating(true);
    try {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: accessToken,
      });
      if (sessionError) {
        toast("رابط إعادة التعيين منتهي أو غير صالح.", "error");
        setIsUpdating(false);
        return;
      }
      const result = await updatePassword(passwordData.newPassword);
      if (result.success) {
        toast(result.message, "success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast(result.error || "حدث خطأ أثناء تحديث كلمة المرور", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تحديث كلمة المرور", "error");
      // console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="update-password-container">
      <div className="update-password-form">
        <h2>تحديث كلمة المرور</h2>
        <p className="update-info">
          يرجى إدخال كلمة المرور الجديدة التي تريد استخدامها.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group password-field">
            <div className="password-label-wrapper">
              <label htmlFor="newPassword">كلمة المرور الجديدة</label>
              <button
                type="button"
                className="info-button"
                onClick={toggleTooltip}
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </div>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleChange}
              required
              className={
                passwordData.newPassword &&
                !Object.values(passwordErrors).every((val) => !val)
                  ? "input-error"
                  : ""
              }
            />
            {showTooltip && (
              <div className="mobile-tooltip">
                <div className="tooltip-content-mobile">
                  <div className="tooltip-header">
                    <span>متطلبات كلمة المرور</span>
                    <button
                      type="button"
                      onClick={toggleTooltip}
                      className="close-tooltip"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <ul style={{ paddingRight: "15px", margin: "10px 0" }}>
                    <li
                      className={
                        !passwordErrors.length ? "valid-requirement" : ""
                      }
                    >
                      {!passwordErrors.length ? "✓" : "•"} 8 أحرف على الأقل
                    </li>
                    <li
                      className={
                        !passwordErrors.uppercase ? "valid-requirement" : ""
                      }
                    >
                      {!passwordErrors.uppercase ? "✓" : "•"} حرف كبير واحد على
                      الأقل
                    </li>
                    <li
                      className={
                        !passwordErrors.lowercase ? "valid-requirement" : ""
                      }
                    >
                      {!passwordErrors.lowercase ? "✓" : "•"} حرف صغير واحد على
                      الأقل
                    </li>
                    <li
                      className={
                        !passwordErrors.number ? "valid-requirement" : ""
                      }
                    >
                      {!passwordErrors.number ? "✓" : "•"} رقم واحد على الأقل
                    </li>
                  </ul>
                </div>
              </div>
            )}
            {passwordData.newPassword && (
              <div className="password-strength-indicator">
                <div className="password-requirements">
                  <span
                    className={
                      !passwordErrors.length
                        ? "requirement-met"
                        : "requirement-not-met"
                    }
                  >
                    {!passwordErrors.length ? "✓" : "•"} 8 أحرف
                  </span>
                  <span
                    className={
                      !passwordErrors.uppercase
                        ? "requirement-met"
                        : "requirement-not-met"
                    }
                  >
                    {!passwordErrors.uppercase ? "✓" : "•"} حرف كبير
                  </span>
                  <span
                    className={
                      !passwordErrors.lowercase
                        ? "requirement-met"
                        : "requirement-not-met"
                    }
                  >
                    {!passwordErrors.lowercase ? "✓" : "•"} حرف صغير
                  </span>
                  <span
                    className={
                      !passwordErrors.number
                        ? "requirement-met"
                        : "requirement-not-met"
                    }
                  >
                    {!passwordErrors.number ? "✓" : "•"} رقم
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="form-group password-field">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handleChange}
              required
              className={
                passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword
                  ? "input-error"
                  : ""
              }
            />
            {passwordData.confirmPassword &&
              passwordData.newPassword !== passwordData.confirmPassword && (
                <span className="error-message">كلمات المرور غير متطابقة</span>
              )}
          </div>
          <button type="submit" disabled={isUpdating}>
            {isUpdating ? "جاري التحديث..." : "تحديث كلمة المرور"}
          </button>
        </form>
        <div className="back-to-login">
          <button onClick={() => navigate("/login")}>
            العودة إلى صفحة تسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UpdatePassword);
