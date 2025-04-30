import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  resetPassword,
  updatePassword,
  updateUserProfile,
} from "../../supabase/authUtils";
import { updateUser } from "../../redux/slices/userSlice";
import "../../style/Profile.css";
import useToast from "../../hooks/useToast";
const Loader = React.lazy(() => import("../common/Loader"));

const UserProfile = memo(() => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: "",
    date_of_birth: "",
    address: "",
  });

  useEffect(() => {
    document.title = "الملف الشخصي | مركز ميدورا";
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else if (user) {
      setUserData({
        full_name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "",
        date_of_birth: user.date_of_birth || "",
        address: user.address || "",
      });
    }
  }, [isAuthenticated, navigate, user]);

  const handleResetPassword = useCallback(async () => {
    setIsResettingPassword(true);
    try {
      const result = await resetPassword(user.email);
      if (result.success) {
        toast(result.message, "success");
      } else {
        toast(
          result.error || "حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور",
          "error"
        );
      }
    } catch (error) {
      toast("حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور", "error");
      // console.error(error);
    } finally {
      setIsResettingPassword(false);
    }
  }, [user, toast]);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleUpdatePassword = useCallback(async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast("كلمات المرور غير متطابقة", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast("يجب أن تكون كلمة المرور 6 أحرف على الأقل", "error");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const result = await updatePassword(passwordData.newPassword);
      if (result.success) {
        toast(result.message, "success");
        setShowChangePassword(false);
        setPasswordData({
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast(result.error || "حدث خطأ أثناء تحديث كلمة المرور", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تحديث كلمة المرور", "error");
      // console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [passwordData, toast, updatePassword]);

  const handleUserDataChange = useCallback((e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleUpdateProfile = useCallback(async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const result = await updateUserProfile(userData);

      if (result.success) {
        toast(result.message, "success");
        setEditMode(false);

        if (result.profile) {
          dispatch(
            updateUser({
              ...user,
              name: result.profile.full_name,
              phone: result.profile.phone,
              gender: result.profile.gender,
              date_of_birth: result.profile.date_of_birth,
              address: result.profile.address,
            })
          );
        }
      } else {
        toast(result.error || "حدث خطأ أثناء تحديث الملف الشخصي", "error");
      }
    } catch (error) {
      toast("حدث خطأ أثناء تحديث الملف الشخصي", "error");
      // console.error(error);
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [userData, toast, dispatch, user]);

  if (!user) {
    return <Loader />;
  }

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

  const isGoogleProvider = supabaseProvider === "google";
  
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>الملف الشخصي</h1>
      </div>
      <div className="profile-content">
        <div className="profile-info">
          <div className="profile-info-header">
            <h2>بياناتك الشخصية</h2>
            {!editMode && (
              <button
                className="action-button edit-button"
                onClick={() => setEditMode(true)}
              >
                تعديل المعلومات
              </button>
            )}
          </div>

          {!editMode ? (
            <div className="user-info-display">
              <div className="info-item">
                <span className="info-label">الاسم:</span>
                <span className="info-value">{userData.full_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">البريد الإلكتروني:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">رقم الهاتف:</span>
                <span className="info-value">
                  {userData.phone || "غير محدد"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">الجنس:</span>
                <span className="info-value">
                  {userData.gender === "male"
                    ? "ذكر"
                    : userData.gender === "female"
                    ? "أنثى"
                    : "غير محدد"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">تاريخ الميلاد:</span>
                <span className="info-value">
                  {userData.date_of_birth || "غير محدد"}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">العنوان:</span>
                <span className="info-value">
                  {userData.address || "غير محدد"}
                </span>
              </div>
            </div>
          ) : (
            <form className="user-info-form" onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="full_name">الاسم</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={userData.full_name}
                  onChange={handleUserDataChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userData.email}
                  onChange={handleUserDataChange}
                  required
                  disabled
                />
                <small className="form-note">
                  لا يمكن تغيير البريد الإلكتروني
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleUserDataChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">الجنس</label>
                <select
                  id="gender"
                  name="gender"
                  value={userData.gender}
                  onChange={handleUserDataChange}
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="date_of_birth">تاريخ الميلاد</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={userData.date_of_birth}
                  onChange={handleUserDataChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">العنوان</label>
                <textarea
                  id="address"
                  name="address"
                  value={userData.address}
                  onChange={handleUserDataChange}
                  rows="3"
                ></textarea>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="action-button"
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? "جاري التحديث..." : "حفظ التغييرات"}
                </button>
                <button
                  type="button"
                  className="action-button cancel-button"
                  onClick={() => setEditMode(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>
        {!isGoogleProvider && (
          <div className="profile-info">
            <h2>إعدادات الحساب</h2>
            <div className="account-actions">
              {!showChangePassword ? (
                <>
                  <button
                    className="action-button"
                    onClick={() => setShowChangePassword(true)}
                  >
                    تغيير كلمة المرور
                  </button>
                  <button
                    className="action-button reset-password-button"
                    onClick={handleResetPassword}
                    disabled={isResettingPassword}
                  >
                    {isResettingPassword
                      ? "جاري إرسال رابط إعادة التعيين..."
                      : "إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني"}
                  </button>
                </>
              ) : (
                <div className="change-password-form">
                  <h3>تغيير كلمة المرور</h3>
                  <form onSubmit={handleUpdatePassword}>
                    <div className="form-group">
                      <label htmlFor="newPassword">كلمة المرور الجديدة</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">
                        تأكيد كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="action-button"
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword
                          ? "جاري التحديث..."
                          : "تحديث كلمة المرور"}
                      </button>
                      <button
                        type="button"
                        className="action-button cancel-button"
                        onClick={() => {
                          setShowChangePassword(false);
                          setPasswordData({
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default UserProfile;
