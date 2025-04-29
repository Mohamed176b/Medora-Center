import "../../style/Register.css";
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  registerUser,
  signInWithGoogle,
  handleGoogleRedirect,
  getUserProviderByEmail,
} from "../../supabase/authUtils";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import useToast from "../../hooks/useToast";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({
    length: true,
    uppercase: true,
    lowercase: true,
    number: true,
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const location = useLocation();

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

  useEffect(() => {
    const handleGoogleAuth = async () => {
      const query = new URLSearchParams(location.search);
      const isGoogleProvider = query.get("provider") === "google";

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

            toast("تم التسجيل بنجاح", "success");
            navigate("/profile");
          } else {
            toast(result.error || "حدث خطأ أثناء التسجيل مع Google", "error");
          }
        } catch (error) {
          toast("حدث خطأ أثناء التسجيل مع Google", "error");
          // console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleGoogleAuth();
  }, [location, navigate, dispatch, toast]);

  const handleChange = React.useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "password") {
      validatePassword(value);
    }
  }, []);

  const handleGoogleSignIn = React.useCallback(async () => {
    try {
      const result = await signInWithGoogle("register");

      if (!result.success) {
        toast(result.error || "حدث خطأ أثناء التسجيل باستخدام Google", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء التسجيل باستخدام Google", "error");
      // console.error(error);
    }
  }, [toast]);

  const toggleTooltip = React.useCallback(() => {
    setShowTooltip((prev) => !prev);
  }, []);

  const handleSubmit = React.useCallback(async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast("جميع الحقول مطلوبة", "warning");
      return;
    }

    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid) {
      toast("كلمة المرور لا تطابق المعايير المطلوبة", "warning");
      setShowTooltip(true);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast("كلمات المرور غير متطابقة", "warning");
      return;
    }

    setLoading(true);
    try {
      const provider = await getUserProviderByEmail(formData.email);
      if (provider === 'google') {
        toast("هذا البريد الإلكتروني مسجل مسبقًا عبر Google. يرجى تسجيل الدخول باستخدام Google.", "error");
        setLoading(false);
        return;
      }
      const result = await registerUser(
        formData.email,
        formData.password,
        formData.name
      );

      if (result.success && result.emailConfirmationSent) {
        toast("تم إرسال رابط التحقق إلى بريدك الإلكتروني", "success");
        navigate("/login");
      } else if (result.success) {
        dispatch(
          setUser({
            id: result.user.id,
            email: formData.email,
            name: formData.name,
          })
        );
        toast("تم تسجيل الحساب بنجاح", "success");
        navigate("/profile");
      } else {
        toast(result.error || "حدث خطأ أثناء التسجيل", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء التسجيل", "error");
      // console.error(error);
    } finally {
      setLoading(false);
    }
  }, [toast, navigate, dispatch, formData, setLoading]);

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>تسجيل حساب جديد</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">الاسم</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group password-field">
            <div className="password-label-wrapper">
              <label htmlFor="password">كلمة المرور</label>
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
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={
                formData.password &&
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
            {formData.password && (
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
                    {!passwordErrors.number ? "✓" : "."} رقم
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="form-group password-field">
            <label htmlFor="confirmPassword">تأكيد كلمة المرور</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className={
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? "input-error"
                  : ""
              }
            />
            {formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <span className="error-message">كلمات المرور غير متطابقة</span>
              )}
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "جاري التسجيل..." : "تسجيل"}
          </button>
        </form>
        <div className="social-login-container">
          <p>أو سجل باستخدام</p>
          <div className="social-login">
            <button onClick={handleGoogleSignIn}>
              <i className="fab fa-google"></i>
            </button>
          </div>
        </div>
        <p className="login-link">
          لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
};

export default React.memo(Register);
