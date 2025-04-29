import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import { format } from "date-fns";
import { arEG } from "date-fns/locale";
import useToast from "../../../hooks/useToast";
import styles from "../../../style/Testimonials.module.css";
import useAdminState from "../../../hooks/useAdminState";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllTestimonialsData,
  updateTestimonials,
} from "../../../redux/slices/adminSlice";
const Loader = React.lazy(() => import("../../common/Loader"));

const TestimonialCard = memo(
  ({ testimonial, onStatusChange, onDelete, canEdit, formatDate }) => {
    return (
      <div className={styles.testimonialCard}>
        <div className={styles.testimonialHeader}>
          <div className={styles.userInfo}>
            <h3>{testimonial.patients?.full_name || "مستخدم غير معروف"}</h3>
            <span className={styles.testimonialDate}>
              {formatDate(testimonial.created_at)}
            </span>
          </div>
          <div className={styles.rating}>
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={`${styles.star} ${
                  index < testimonial.rating ? styles.filled : ""
                }`}
              >
                {index < testimonial.rating ? "★" : "☆"}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.testimonialContent}>
          <p>{testimonial.content}</p>
        </div>

        <div className={styles.testimonialFooter}>
          <div className={styles.statusSection}>
            <span
              className={`${styles.statusBadge} ${
                testimonial.is_reviewed ? styles.reviewed : styles.pending
              }`}
            >
              {testimonial.is_reviewed ? "تمت المراجعة" : "قيد المراجعة"}
            </span>
            {canEdit && (
              <button
                className={styles.toggleStatusBtn}
                onClick={() =>
                  onStatusChange(testimonial.id, !testimonial.is_reviewed)
                }
              >
                {testimonial.is_reviewed ? "إلغاء المراجعة" : "تأكيد المراجعة"}
              </button>
            )}
          </div>
          {canEdit && (
            <button
              className={styles.deleteBtn}
              onClick={() => onDelete(testimonial.id)}
            >
              <i className="fas fa-trash-alt"></i>
              حذف
            </button>
          )}
        </div>
      </div>
    );
  }
);

const Testimonials = () => {
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.testimonials
  );
  const admin = useAdminState();
  const canEdit =
    admin?.role === "super-admin" ||
    admin?.role === "admin" ||
    admin?.role === "moderator";
  const dispatch = useDispatch();
  const testimonials = useSelector((state) => state.admin?.allTestimonialsData);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      dispatch(fetchAllTestimonialsData());
    } catch (error) {
      // console.error("Error fetching testimonials:", error);
      toast("حدث خطأ أثناء جلب التقييمات", "error");
    } finally {
      setLoading(false);
    }
  }, [dispatch, toast]);

  const handleReviewStatusChange = useCallback(
    async (testimonialId, newStatus) => {
      try {
        const { error } = await supabase
          .from("testimonials")
          .update({ is_reviewed: newStatus })
          .eq("id", testimonialId);

        if (error) throw error;

        const updatedTestimonials = testimonials.map((t) =>
          t.id === testimonialId ? { ...t, is_reviewed: newStatus } : t
        );
        dispatch(updateTestimonials(updatedTestimonials));

        toast("تم تحديث حالة التقييم بنجاح", "success");
      } catch (error) {
        // console.error("Error updating testimonial status:", error);
        toast("حدث خطأ أثناء تحديث حالة التقييم", "error");
      }
    },
    [testimonials, dispatch, toast]
  );

  const handleDelete = useCallback(
    async (testimonialId) => {
      if (!window.confirm("هل أنت متأكد من حذف هذا التقييم؟")) return;

      try {
        const { error } = await supabase
          .from("testimonials")
          .delete()
          .eq("id", testimonialId);

        if (error) throw error;

        const updatedTestimonials = testimonials.filter(
          (t) => t.id !== testimonialId
        );
        dispatch(updateTestimonials(updatedTestimonials));

        toast("تم حذف التقييم بنجاح", "success");
      } catch (error) {
        // console.error("Error deleting testimonial:", error);
        toast("حدث خطأ أثناء حذف التقييم", "error");
      }
    },
    [testimonials, dispatch, toast]
  );

  const formatDate = useCallback((dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: arEG });
  }, []);

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((testimonial) => {
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "reviewed" && testimonial.is_reviewed) ||
        (filterStatus === "pending" && !testimonial.is_reviewed);

      const matchesSearch =
        searchTerm === "" ||
        testimonial.patients?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [testimonials, filterStatus, searchTerm]);

  useEffect(() => {
    if ((!testimonials || testimonials.length === 0) && isAuthorized) {
      fetchTestimonials();
    } else {
      setLoading(false);
    }
  }, [dispatch, isAuthorized]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.testimonialsContainer}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>إدارة التقييمات</h1>
        </div>
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="البحث في التقييمات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">جميع التقييمات</option>
            <option value="reviewed">تمت المراجعة</option>
            <option value="pending">قيد المراجعة</option>
          </select>
        </div>
      </div>

      {filteredTestimonials.length === 0 ? (
        <div className={styles.noResults}>
          <i className="fas fa-comment-slash"></i>
          <p>لا توجد تقييمات مطابقة للبحث</p>
        </div>
      ) : (
        <div className={styles.testimonialsList}>
          {filteredTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onStatusChange={handleReviewStatusChange}
              onDelete={handleDelete}
              canEdit={canEdit}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(Testimonials);
