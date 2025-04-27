import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/DoctorManagement.module.css";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import ButtonLoader from "../../admin/siteSettings/ButtonLoader";
import { fetchDoctorsData } from "../../../redux/slices/siteDataSlice";

const DoctorForm = ({
  editMode,
  currentDoctor,
  currentDoctorId,
  resetForm,
  fetchDoctors,
}) => {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    is_active: true,
  });

  const [doctorImage, setDoctorImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    if (editMode && currentDoctor) {
      setFormData({
        full_name: currentDoctor.full_name,
        email: currentDoctor.email,
        phone: currentDoctor.phone || "",
        specialization: currentDoctor.specialization || "",
        bio: currentDoctor.bio || "",
        is_active: currentDoctor.is_active,
      });
      setImagePreview(currentDoctor.image_url);
    } else {
      resetFormData();
    }
  }, [editMode, currentDoctor]);

  const resetFormData = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      specialization: "",
      bio: "",
      is_active: true,
    });
    setDoctorImage(null);
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDoctorImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteOldDoctorImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      const urlPath = imageUrl.split("/").slice(-2).join("/");

      if (urlPath) {
        const { error } = await supabase.storage
          .from("doctors-images")
          .remove([urlPath]);

        if (error) throw error;
        console.log("تم حذف الصورة القديمة بنجاح");
      }
    } catch (error) {
      console.error("خطأ في حذف الصورة القديمة:", error.message);
    }
  };

  const uploadDoctorImage = async () => {
    if (!doctorImage) return null;

    try {
      // Create a unique file name
      const fileExt = doctorImage.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `doctors/${fileName}`;

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from("doctors-images")
        .upload(filePath, doctorImage, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicURLData } = supabase.storage
        .from("doctors-images")
        .getPublicUrl(filePath);

      return publicURLData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error.message);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Validate required fields
      if (!formData.full_name || !formData.email) {
        throw new Error("الاسم والبريد الإلكتروني مطلوبان");
      }

      let imageUrl = null;

      // Upload image if selected
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

      let result;

      if (editMode) {
        // Update existing doctor
        const updates = {
          ...formData,
          updated_at: new Date(),
        };

        // Only update image if a new one was uploaded
        if (imageUrl) {
          updates.image_url = imageUrl;
        }

        const { data, error } = await supabase
          .from("doctors")
          .update(updates)
          .eq("id", currentDoctorId)
          .select()
          .single();

        if (error) throw error;
        result = data;

        dispatch(
          showToast({
            message: "تم تحديث بيانات الطبيب بنجاح",
            type: "success",
          })
        );
        dispatch(fetchDoctorsData());
      } else {
        // Create new doctor
        const newDoctor = {
          ...formData,
          image_url: imageUrl,
        };

        const { data, error } = await supabase
          .from("doctors")
          .insert([newDoctor])
          .select()
          .single();

        if (error) throw error;
        result = data;

        dispatch(
          showToast({
            message: "تم إضافة الطبيب بنجاح",
            type: "success",
          })
        );
      }

      // Reset form and refresh doctor list
      resetFormData();
      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error.message);
      dispatch(
        showToast({
          message: `خطأ في حفظ بيانات الطبيب: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setSaving(false);
    }
  };

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
            <label htmlFor="specialization">التخصص</label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization}
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
                  <img src={imagePreview} alt="معاينة صورة الطبيب" />
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

export default DoctorForm;
