import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../../supabase/supabaseClient";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import "../../../style/SiteSettings.css";
import Loader from "../../common/Loader";
import { showToast } from "../../../redux/slices/toastSlice";
import {
  fetchSiteSettings,
  updateSiteSettings,
} from "../../../redux/slices/adminSlice";
import useAdminState from "../../../hooks/useAdminState";
const AboutUsSettings = React.lazy(()=>import( "./AboutUsSettings"));
const HomeSettings = React.lazy(()=>import( "./HomeSettings"));
const ContactSettings = React.lazy(()=>import( "./ContactSettings"));

const SiteSettings = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.siteSettings
  );
  const dispatch = useDispatch();
  const admin = useAdminState();
  const { home, about, contact, loading, error } = useSelector(
    (state) => state.admin.siteSettings
  );

  const [currentPage, setCurrentPage] = useState("home");

  const canEdit = useMemo(() => admin.role === "super-admin" || admin.role === "admin", [admin.role]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    page_key: "home",
    background_image_url: "",
    catchy_title: "",
    simple_description: "",
    center_overview: "",
    years_experience: 0,
    why_choose_us: "",
    short_history: "",
    center_image_url: "",
    long_term_goal: "",
    mission_statement: "",
    patients_served_count: 0,
    departments_count: 0,
  });

  const backgroundImageRef = useRef(null);
  const centerImageRef = useRef(null);

  const [backgroundImageFile, setBackgroundImageFile] = useState(null);
  const [centerImageFile, setCenterImageFile] = useState(null);
  const [, setUploadingImages] = useState(false);

  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null);
  const [centerImagePreview, setCenterImagePreview] = useState(null);

  useEffect(() => {
    document.title = "إدارة محتوى الموقع والاعدادات | لوحة التحكم | مركز ميدورا";
  }, []);

  useEffect(() => {
    if (
      !home ||
      !about ||
      !contact ||
      home.length === 0 ||
      about.length === 0 ||
      contact.length === 0
    ) {
      dispatch(fetchSiteSettings());
    }
  }, [dispatch]);

  useEffect(() => {
    let currentData;
    switch (currentPage) {
      case "home":
        currentData = home;
        break;
      case "about_us":
        currentData = about;
        break;
      default:
        currentData = null;
    }

    if (currentData) {
      setFormData(currentData);
    } else {
      setFormData({
        page_key: currentPage,
        background_image_url: "",
        catchy_title: "",
        simple_description: "",
        center_overview: "",
        years_experience: 0,
        why_choose_us: "",
        short_history: "",
        center_image_url: "",
        long_term_goal: "",
        mission_statement: "",
        patients_served_count: 0,
        departments_count: 0,
      });
    }

    if (backgroundImagePreview) {
      URL.revokeObjectURL(backgroundImagePreview);
      setBackgroundImagePreview(null);
    }
    if (centerImagePreview) {
      URL.revokeObjectURL(centerImagePreview);
      setCenterImagePreview(null);
    }

    setBackgroundImageFile(null);
    setCenterImageFile(null);
    if (backgroundImageRef.current) backgroundImageRef.current.value = "";
    if (centerImageRef.current) centerImageRef.current.value = "";
  }, [currentPage, home, about]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (
      [
        "years_experience",
        "patients_served_count",
        "departments_count",
      ].includes(name)
    ) {
      processedValue = parseInt(value) || 0;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const { name, files } = e.target;

    if (files && files.length > 0) {
      const file = files[0];

      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          showToast({
            message: "حجم الملف كبير جدًا، يجب أن لا يتعدى 5 ميجابايت",
            type: "error",
          })
        );
        e.target.value = "";
        return;
      }

      if (!file.type.match("image.*")) {
        dispatch(
          showToast({
            message: "يجب اختيار ملف صورة فقط",
            type: "error",
          })
        );
        e.target.value = "";
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      if (name === "background_image") {
        if (backgroundImagePreview) {
          URL.revokeObjectURL(backgroundImagePreview);
        }
        setBackgroundImageFile(file);
        setBackgroundImagePreview(previewUrl);
      } else if (name === "center_image") {
        if (centerImagePreview) {
          URL.revokeObjectURL(centerImagePreview);
        }
        setCenterImageFile(file);
        setCenterImagePreview(previewUrl);
      }
    }
  }, [backgroundImagePreview, centerImagePreview, dispatch]);

  const uploadImages = useCallback(async () => {
    setUploadingImages(true);
    let updatedFormData = { ...formData };

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error("جلسة المستخدم غير نشطة");
      }

      if (backgroundImageFile) {
        if (formData.background_image_url) {
          try {
            const urlPath = formData.background_image_url
              .split("/")
              .slice(-2)
              .join("/");
            if (urlPath) {
              await supabase.storage.from("site-images").remove([urlPath]);
              // console.log("Old background image deleted");
            }
          } catch (deleteError) {
            // console.error("Error deleting old background image:", deleteError);
          }
        }

        const fileExt = backgroundImageFile.name.split(".").pop();
        const fileName = `${currentPage}_background_${Date.now()}.${fileExt}`;
        const filePath = `${currentPage}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("site-images")
          .upload(filePath, backgroundImageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("site-images")
          .getPublicUrl(filePath);

        updatedFormData.background_image_url = publicURLData.publicUrl;
      }

      if (centerImageFile) {
        if (formData.center_image_url) {
          try {
            const urlPath = formData.center_image_url
              .split("/")
              .slice(-2)
              .join("/");
            if (urlPath) {
              await supabase.storage.from("site-images").remove([urlPath]);
              // console.log("Old center image deleted");
            }
          } catch (deleteError) {
            // console.error("Error deleting old center image:", deleteError);
          }
        }

        const fileExt = centerImageFile.name.split(".").pop();
        const fileName = `${currentPage}_center_${Date.now()}.${fileExt}`;
        const filePath = `${currentPage}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("site-images")
          .upload(filePath, centerImageFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: publicURLData } = supabase.storage
          .from("site-images")
          .getPublicUrl(filePath);

        updatedFormData.center_image_url = publicURLData.publicUrl;
      }

      setFormData(updatedFormData);
      return updatedFormData;
    } catch (error) {
      console.error("Error uploading images:", error);
      dispatch(
        showToast({
          message: "خطأ في رفع الصور",
          type: "error",
        })
      );
      throw error;
    } finally {
      setUploadingImages(false);
    }
  }, [formData, backgroundImageFile, centerImageFile, currentPage, backgroundImagePreview, centerImagePreview, dispatch]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!canEdit) {
      dispatch(
        showToast({
          message: "ليس لديك صلاحيات لحفظ التغييرات",
          type: "error",
        })
      );
      return;
    }

    try {
      setSaving(true);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        throw new Error("جلسة المستخدم غير نشطة");
      }

      let dataToSave = { ...formData };

      if (backgroundImageFile || centerImageFile) {
        try {
          dataToSave = await uploadImages();
        } catch (error) {
          throw new Error("فشل في رفع الصور");
        }
      }

      const { data: existingData } = await supabase
        .from("pages_content")
        .select("page_key")
        .eq("page_key", currentPage)
        .single();

      let result;

      if (existingData) {
        result = await supabase
          .from("pages_content")
          .update(dataToSave)
          .eq("page_key", currentPage);
      } else {
        result = await supabase.from("pages_content").insert([dataToSave]);
      }

      if (result.error) {
        throw result.error;
      }

      dispatch(
        showToast({
          message: "تم حفظ الإعدادات بنجاح",
          type: "success",
        })
      );

      dispatch(updateSiteSettings({ page: currentPage, data: dataToSave }));

      setBackgroundImageFile(null);
      setCenterImageFile(null);
      if (backgroundImageRef.current) backgroundImageRef.current.value = "";
      if (centerImageRef.current) centerImageRef.current.value = "";

      if (backgroundImagePreview) {
        URL.revokeObjectURL(backgroundImagePreview);
        setBackgroundImagePreview(null);
      }
      if (centerImagePreview) {
        URL.revokeObjectURL(centerImagePreview);
        setCenterImagePreview(null);
      }
    } catch (error) {
      console.error("Error saving site settings:", error);
      dispatch(
        showToast({
          message: "خطأ في حفظ الإعدادات",
          type: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  }, [canEdit, dispatch, backgroundImageFile, centerImageFile, uploadImages, formData, currentPage, backgroundImagePreview, centerImagePreview, backgroundImageRef, centerImageRef]);

  const handlePageChange = useCallback((page) => {
    if (backgroundImagePreview) {
      URL.revokeObjectURL(backgroundImagePreview);
      setBackgroundImagePreview(null);
    }
    if (centerImagePreview) {
      URL.revokeObjectURL(centerImagePreview);
      setCenterImagePreview(null);
    }

    setCurrentPage(page);
  }, []);

  const getImageNameFromUrl = useCallback((url) => {
    if (!url) return "لا توجد صورة";
    const urlParts = url.split("/");
    return urlParts[urlParts.length - 1];
  }, []);

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="error-message">حدث خطأ: {error}</div>;
  }

  return (
    <div className="site-settings-container">
      <h1 className="site-settings-title">إعدادات الموقع</h1>

      <div className="page-selector-container">
        <div className="page-selector">
          <button
            className={currentPage === "home" ? "active" : ""}
            onClick={() => setCurrentPage("home")}
          >
            <i className="fas fa-home"></i>
            <span>الصفحة الرئيسية</span>
          </button>
          <button
            className={currentPage === "about_us" ? "active" : ""}
            onClick={() => setCurrentPage("about_us")}
          >
            <i className="fas fa-info-circle"></i>
            <span>من نحن</span>
          </button>
          <button
            className={currentPage === "contact" ? "active" : ""}
            onClick={() => setCurrentPage("contact")}
          >
            <i className="fas fa-phone"></i>
            <span>معلومات التواصل</span>
          </button>
        </div>
      </div>

      {currentPage === "home" ? (
        <HomeSettings
          formData={formData}
          handleChange={handleChange}
          backgroundImageFile={backgroundImageFile}
          backgroundImagePreview={backgroundImagePreview}
          backgroundImageRef={backgroundImageRef}
          handleSubmit={handleSubmit}
          canEdit={canEdit}
          saving={saving}
          getImageNameFromUrl={getImageNameFromUrl}
          handleImageChange={handleImageChange}
        />
      ) : currentPage === "about_us" ? (
        <AboutUsSettings
          formData={formData}
          handleChange={handleChange}
          centerImageFile={centerImageFile}
          centerImagePreview={centerImagePreview}
          centerImageRef={centerImageRef}
          handleSubmit={handleSubmit}
          canEdit={canEdit}
          saving={saving}
          getImageNameFromUrl={getImageNameFromUrl}
          handleImageChange={handleImageChange}
        />
      ) : (
        <ContactSettings
          canEdit={canEdit}
          contactData={contact}
          dispatch={dispatch}
        />
      )}
    </div>
  );
};

export default memo(SiteSettings);
