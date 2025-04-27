import React, { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/DoctorManagement.module.css";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import Loader from "../../common/Loader";
import DoctorItem from "./DoctorItem";
import DoctorCard from "./DoctorCard";

const DoctorList = ({
  doctors,
  loading,
  canEdit,
  onEditDoctor,
  fetchDoctors,
}) => {
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleDeleteDoctor = async (id) => {
    if (!canEdit || deleting) return;

    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا الطبيب؟")) return;

    try {
      setDeleting(true);

      // جلب بيانات الطبيب للحصول على رابط الصورة قبل الحذف
      const { data: doctorToDelete, error: fetchError } = await supabase
        .from("doctors")
        .select("image_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // حذف الطبيب من قاعدة البيانات
      const { error: deleteError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // حذف صورة الطبيب من التخزين إذا كانت موجودة
      if (doctorToDelete?.image_url) {
        await deleteOldDoctorImage(doctorToDelete.image_url);
      }

      dispatch(
        showToast({
          message: "تم حذف الطبيب بنجاح",
          type: "success",
        })
      );

      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error.message);
      dispatch(
        showToast({
          message: `خطأ في حذف الطبيب: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles["doctors-loader-wrapper"]}>
          <Loader />
        </div>
      );
    }

    if (doctors.length === 0) {
      return (
        <div className={styles.noResults}>
          <i className="fas fa-search-minus"></i>
          <p>لا توجد نتائج مطابقة للبحث أو الفلتر</p>
        </div>
      );
    }

    if (isSmallScreen) {
      return (
        <div className={styles.doctorCardsContainer}>
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              canEdit={canEdit}
              onEdit={onEditDoctor}
              onDelete={handleDeleteDoctor}
              isDeleting={deleting}
            />
          ))}
        </div>
      );
    }

    return (
      <div className={styles["table-responsive"]}>
        <table className={styles["doctors-table"]}>
          <thead>
            <tr>
              <th>الصورة</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>رقم الهاتف</th>
              <th>التخصص</th>
              <th>الحالة</th>
              {canEdit && <th>الإجراءات</th>}
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <DoctorItem
                key={doctor.id}
                doctor={doctor}
                canEdit={canEdit}
                onEdit={onEditDoctor}
                onDelete={handleDeleteDoctor}
                isDeleting={deleting}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles["doctors-list-container"]}>
      <h2>قائمة الأطباء</h2>
      {renderContent()}
    </div>
  );
};

export default DoctorList;
