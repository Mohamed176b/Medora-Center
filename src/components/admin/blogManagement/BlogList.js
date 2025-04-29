import React, { useState, useCallback, useMemo, memo } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/BlogManagement.module.css";
import { useDispatch } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import Loader from "../../common/Loader";

const BlogTableRow = memo(
  ({
    post,
    formatDate,
    blogViewsMap,
    canEdit,
    isViewer,
    onEdit,
    onDelete,
    onView,
    onPublish,
    disabledButtonStyle,
  }) => (
    <tr>
      <td data-label="العنوان">{post.title}</td>
      <td data-label="التصنيفات">
        {post.categories?.map((category) => (
          <span key={category.id} className={styles["categories-tag"]}>
            {category.name}
          </span>
        ))}
      </td>
      <td data-label="تاريخ الإنشاء">{formatDate(post.created_at)}</td>
      <td data-label="تاريخ النشر">
        {post.is_published ? formatDate(post.published_at) : "غير منشور"}
      </td>
      <td data-label="عدد المشاهدات">
        {blogViewsMap ? blogViewsMap[post.id] || 0 : 0}
      </td>
      <td data-label="الحالة">
        <span
          className={
            post.is_published
              ? styles["status-published"]
              : styles["status-draft"]
          }
        >
          {post.is_published ? "منشور" : "مسودة"}
        </span>
      </td>
      <td className={styles["actions-cell"]} data-label="الإجراءات">
        {canEdit ? (
          <>
            <button
              className={styles["edit-button"]}
              onClick={() => onEdit(post)}
            >
              تعديل
            </button>
            <button
              className={styles["delete-button"]}
              onClick={() => onDelete(post)}
            >
              حذف
            </button>
            <button
              className={styles["view-button"]}
              onClick={() => onView(post)}
            >
              عرض
            </button>
            <button
              className={
                post.is_published
                  ? styles["unpublish-button"]
                  : styles["publish-button"]
              }
              onClick={() => onPublish(post)}
            >
              {post.is_published ? "إلغاء النشر" : "نشر"}
            </button>
          </>
        ) : isViewer ? (
          <>
            <button
              className={styles["edit-button"]}
              style={disabledButtonStyle}
            >
              تعديل
            </button>
            <button
              className={styles["delete-button"]}
              style={disabledButtonStyle}
            >
              حذف
            </button>
            <button
              className={styles["view-button"]}
              onClick={() => onView(post)}
            >
              عرض
            </button>
            <button
              className={
                post.is_published
                  ? styles["unpublish-button"]
                  : styles["publish-button"]
              }
              style={disabledButtonStyle}
            >
              {post.is_published ? "إلغاء النشر" : "نشر"}
            </button>
          </>
        ) : null}
      </td>
    </tr>
  )
);

const BlogList = memo(
  ({
    posts,
    loading,
    canEdit,
    isViewer,
    onEditPost,
    fetchPosts,
    handleViewPost,
    blogViewsMap,
  }) => {
    const dispatch = useDispatch();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);
    const [postToToggle, setPostToToggle] = useState(null);

    const formatDate = useCallback((dateString) => {
      if (!dateString) return "غير محدد";
      const date = new Date(dateString);
      return date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }, []);

    const deleteImageFromStorage = useCallback(async (imageUrl) => {
      if (!imageUrl) return;

      try {
        const urlParts = imageUrl.split("/");
        const storageIndex = urlParts.indexOf("site-images");
        if (storageIndex === -1) {
          // console.warn("Invalid image URL format");
          return;
        }

        const filePath = urlParts.slice(storageIndex + 1).join("/");
        if (!filePath) {
          // console.warn("No file path found in URL");
          return;
        }

        const { error } = await supabase.storage
          .from("site-images")
          .remove([filePath]);

        if (error) {
          // console.error("Error deleting image from storage:", error);
          throw error;
        }
      } catch (error) {
        // console.error("Error processing image deletion:", error);
        throw error;
      }
    }, []);

    const handleDeleteClick = useCallback((post) => {
      setPostToDelete(post);
      setShowDeleteDialog(true);
    }, []);

    const handlePublishClick = useCallback((post) => {
      setPostToToggle(post);
      setShowPublishDialog(true);
    }, []);

    const handleDeletePost = useCallback(async () => {
      if (!postToDelete) return;

      try {
        if (postToDelete.attachments?.length > 0) {
          for (const attachment of postToDelete.attachments) {
            await deleteImageFromStorage(attachment.url);
          }
        }

        if (postToDelete.image_url) {
          await deleteImageFromStorage(postToDelete.image_url);
        }

        const { error: categoriesError } = await supabase
          .from("blog_posts_categories")
          .delete()
          .eq("post_id", postToDelete.id);

        if (categoriesError) throw categoriesError;

        const { error } = await supabase
          .from("blog_posts")
          .delete()
          .eq("id", postToDelete.id);

        if (error) throw error;

        dispatch(
          showToast({
            message: "تم حذف المقالة بنجاح",
            type: "success",
          })
        );

        setShowDeleteDialog(false);
        setPostToDelete(null);
        fetchPosts();
      } catch (error) {
        console.error("Error deleting post:", error.message);
        dispatch(
          showToast({
            message: `خطأ في حذف المقالة: ${error.message}`,
            type: "error",
          })
        );
      }
    }, [postToDelete, deleteImageFromStorage, dispatch, fetchPosts]);

    const handleTogglePublish = useCallback(async () => {
      if (!postToToggle) return;

      try {
        const newStatus = !postToToggle.is_published;
        const updateData = {
          is_published: newStatus,
          published_at: newStatus ? new Date().toISOString() : null,
        };

        const { error } = await supabase
          .from("blog_posts")
          .update(updateData)
          .eq("id", postToToggle.id);

        if (error) throw error;

        dispatch(
          showToast({
            message: newStatus
              ? "تم نشر المقالة بنجاح"
              : "تم إلغاء نشر المقالة بنجاح",
            type: "success",
          })
        );

        setShowPublishDialog(false);
        setPostToToggle(null);
        fetchPosts();
      } catch (error) {
        // console.error("Error updating post status:", error);
        dispatch(
          showToast({
            message: `خطأ في تحديث حالة المقالة: ${error.message}`,
            type: "error",
          })
        );
      }
    }, [postToToggle, dispatch, fetchPosts]);

    const disabledButtonStyle = useMemo(
      () => ({
        opacity: 0.6,
        cursor: "not-allowed",
        pointerEvents: "none",
      }),
      []
    );

    if (loading) {
      return (
        <div className={styles.loader}>
          <Loader />
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className={styles["empty-state"]}>
          <p>لا توجد مقالات حاليا. قم بإضافة مقالة جديدة.</p>
        </div>
      );
    }

    return (
      <div className={styles["blog-list"]}>
        {showDeleteDialog && (
          <div className={styles["exit-dialog-overlay"]}>
            <div className={styles["exit-dialog"]}>
              <h3>تأكيد الحذف</h3>
              <p>
                هل أنت متأكد من حذف هذه المقالة؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className={styles["exit-dialog-buttons"]}>
                <button
                  onClick={handleDeletePost}
                  className={styles["delete-button"]}
                >
                  نعم، احذف المقالة
                </button>
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setPostToDelete(null);
                  }}
                  className={styles["cancel-button"]}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {showPublishDialog && (
          <div className={styles["exit-dialog-overlay"]}>
            <div className={styles["exit-dialog"]}>
              <h3>
                تأكيد {postToToggle?.is_published ? "إلغاء النشر" : "النشر"}
              </h3>
              <p>
                هل أنت متأكد من{" "}
                {postToToggle?.is_published ? "إلغاء نشر" : "نشر"} هذه المقالة؟
              </p>
              <div className={styles["exit-dialog-buttons"]}>
                <button
                  onClick={handleTogglePublish}
                  className={
                    postToToggle?.is_published
                      ? styles["unpublish-button"]
                      : styles["publish-button"]
                  }
                >
                  نعم،{" "}
                  {postToToggle?.is_published ? "إلغاء النشر" : "نشر المقالة"}
                </button>
                <button
                  onClick={() => {
                    setShowPublishDialog(false);
                    setPostToToggle(null);
                  }}
                  className={styles["cancel-button"]}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <table className={styles["blog-table"]}>
          <thead>
            <tr>
              <th>العنوان</th>
              <th>التصنيفات</th>
              <th>تاريخ الإنشاء</th>
              <th>تاريخ النشر</th>
              <th>عدد المشاهدات</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <BlogTableRow
                key={post.id}
                post={post}
                formatDate={formatDate}
                blogViewsMap={blogViewsMap}
                canEdit={canEdit}
                isViewer={isViewer}
                onEdit={onEditPost}
                onDelete={handleDeleteClick}
                onView={handleViewPost}
                onPublish={handlePublishClick}
                disabledButtonStyle={disabledButtonStyle}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export default BlogList;
