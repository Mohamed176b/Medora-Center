import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/DoctorManagement.module.css";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import ButtonLoader from "../../admin/siteSettings/ButtonLoader";
import { fetchServicesData } from "../../../redux/slices/siteDataSlice";

const DoctorForm = ({
  editMode,
  currentDoctor,
  currentDoctorId,
  resetForm,
  fetchDoctors,
}) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const services = useSelector((state) => state.siteData?.servicesData) || [];

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    is_active: true,
    services: [],
  });

  const [doctorImage, setDoctorImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (!services || services.length === 0) {
      dispatch(fetchServicesData());
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetFormData = useCallback(() => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      bio: "",
      is_active: true,
      services: [],
    });
    setDoctorImage(null);
    setImagePreview(null);
  }, []);

  useEffect(() => {
    if (editMode && currentDoctor) {
      setFormData({
        full_name: currentDoctor.full_name,
        email: currentDoctor.email,
        phone: currentDoctor.phone || "",
        bio: currentDoctor.bio || "",
        is_active: currentDoctor.is_active,
        services:
          currentDoctor.doctor_services?.map((ds) => ds.service_id) || [],
      });
      setImagePreview(currentDoctor.image_url);
    } else {
      resetFormData();
    }
  }, [editMode, currentDoctor, resetFormData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleImageChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDoctorImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const deleteOldDoctorImage = useCallback(async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const urlPath = imageUrl.split("/").slice(-2).join("/");

      if (urlPath) {
        const { error } = await supabase.storage
          .from("doctors-images")
          .remove([urlPath]);

        if (error) throw error;
        // console.log("تم حذف الصورة القديمة بنجاح");
      }
    } catch (error) {
      // console.error("خطأ في حذف الصورة القديمة:", error.message);
    }
  }, []);

  const uploadDoctorImage = useCallback(async () => {
    if (!doctorImage) return null;

    try {
      const fileExt = doctorImage.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `doctors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("doctors-images")
        .upload(filePath, doctorImage, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicURLData } = supabase.storage
        .from("doctors-images")
        .getPublicUrl(filePath);

      return publicURLData.publicUrl;
    } catch (error) {
      // console.error("Error uploading image:", error.message);
      throw error;
    }
  }, [doctorImage]);

  const handleEditDoctor = useCallback(
    async (imageUrl) => {
      const { full_name, email, phone, bio, is_active, services } = formData;
      const doctorUpdates = {
        full_name,
        email,
        phone,
        bio,
        is_active,
        updated_at: new Date(),
      };

      if (imageUrl) {
        doctorUpdates.image_url = imageUrl;
      }

      const { error: updateError } = await supabase
        .from("doctors")
        .update(doctorUpdates)
        .eq("id", currentDoctorId)
        .select()
        .single();

      if (updateError) throw updateError;

      const { error: deleteServicesError } = await supabase
        .from("doctor_services")
        .delete()
        .eq("doctor_id", currentDoctorId);

      if (deleteServicesError) throw deleteServicesError;

      if (services && services.length > 0) {
        const doctorServicesData = services.map((serviceId) => ({
          doctor_id: currentDoctorId,
          service_id: serviceId,
        }));

        const { error: insertServicesError } = await supabase
          .from("doctor_services")
          .insert(doctorServicesData);

        if (insertServicesError) throw insertServicesError;
      }
    },
    [formData, currentDoctorId]
  );

  const handleCreateDoctor = useCallback(
    async (imageUrl) => {
      const { full_name, email, phone, bio, is_active, services } = formData;
      const newDoctor = {
        full_name,
        email,
        phone,
        bio,
        is_active,
        image_url: imageUrl,
      };

      const { data: insertedDoctor, error: insertError } = await supabase
        .from("doctors")
        .insert([newDoctor])
        .select()
        .single();

      if (insertError) throw insertError;

      if (services && services.length > 0) {
        const doctorServicesData = services.map((serviceId) => ({
          doctor_id: insertedDoctor.id,
          service_id: serviceId,
        }));

        const { error: insertServicesError } = await supabase
          .from("doctor_services")
          .insert(doctorServicesData);

        if (insertServicesError) throw insertServicesError;
      }
    },
    [formData]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        setSaving(true);

        if (!formData.full_name || !formData.email) {
          throw new Error("الاسم والبريد الإلكتروني مطلوبان");
        }

        let imageUrl = null;

        if (doctorImage) {
          if (editMode) {
            const { data: doctorData, error: fetchError } = await supabase
              .from("doctors")
              .select("image_url")
              .eq("id", currentDoctorId)
              .single();

            if (!fetchError && doctorData?.image_url) {
              await deleteOldDoctorImage(doctorData.image_url);
            }
          }

          imageUrl = await uploadDoctorImage();
        }

        if (editMode) {
          await handleEditDoctor(imageUrl);
        } else {
          await handleCreateDoctor(imageUrl);
        }

        dispatch(
          showToast({
            message: editMode
              ? "تم تحديث بيانات الطبيب بنجاح"
              : "تم إضافة الطبيب بنجاح",
            type: "success",
          })
        );

        resetFormData();
        resetForm();
        fetchDoctors();
      } catch (error) {
        // console.error("Error saving doctor:", error.message);
        dispatch(
          showToast({
            message: `خطأ في حفظ بيانات الطبيب: ${error.message}`,
            type: "error",
          })
        );
      } finally {
        setSaving(false);
      }
    },
    [
      formData,
      doctorImage,
      editMode,
      currentDoctorId,
      dispatch,
      resetForm,
      fetchDoctors,
      deleteOldDoctorImage,
      uploadDoctorImage,
      handleEditDoctor,
      handleCreateDoctor,
      resetFormData,
    ]
  );

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{editMode ? "تعديل بيانات الطبيب" : "إضافة طبيب جديد"}</h2>
          <button className={styles.closeBtn} onClick={resetForm}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="full_name">الاسم الكامل*</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">البريد الإلكتروني*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone">رقم الهاتف</label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={saving}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">نبذة عن الطبيب</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={saving}
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label>صورة الطبيب</label>
            <div className={styles.imageUploadContainer}>
              {imagePreview && (
                <div className={styles.imagePreview}>
                  <img src={imagePreview} alt="معاينة صورة الطبيب"  loading="lazy"/>
                </div>
              )}
              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => imageInputRef.current.click()}
                disabled={saving}
              >
                اختر صورة
              </button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={imageInputRef}
                className={`${styles.fileInput} ${styles.hidden}`}
                disabled={saving}
              />
              {doctorImage && (
                <div className={styles.selectedFileInfo}>
                  تم اختيار: {doctorImage.name}
                </div>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="services">الخدمات المقدمة*</label>
            <select
              multiple
              id="services"
              name="services"
              value={formData.services}
              onChange={(e) => {
                const selectedServices = Array.from(
                  e.target.selectedOptions,
                  (option) => Number(option.value)
                );
                setFormData((prev) => ({
                  ...prev,
                  services: selectedServices,
                }));
              }}
              className={styles.serviceSelect}
              disabled={saving}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
            <small className={styles.helpText}>
              يمكنك اختيار أكثر من خدمة باستخدام زر Ctrl (أو Command على Mac)
            </small>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                disabled={saving}
              />
              الطبيب نشط حالياً
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? <ButtonLoader /> : editMode ? "حفظ التغييرات" : "إضافة"}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={resetForm}
              disabled={saving}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(DoctorForm);
