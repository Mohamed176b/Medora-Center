// BlogForm.js - Blog post creation/editing form for admin panel
// Handles form state, image uploads, markdown editing, validation, and unsaved changes
import React, { useState, useEffect, useRef, useCallback, useMemo, memo, lazy, Suspense } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/BlogManagement.module.css";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../../../redux/slices/toastSlice";
import Markdown from "react-markdown";
import useAdminState from "../../../hooks/useAdminState";

const ImageViewer = lazy(() => import("./ImageViewer"));
const ProgressBar = lazy(() => import("../../common/ProgressBar"));

// Main BlogForm component, memoized for performance
// Props:
// - editMode: boolean, if true, editing an existing post
// - currentPost: post data for editing
// - resetForm: function to reset form fields
// - fetchPosts: function to refresh posts list
// - isViewer: boolean, if true, user can only view, not edit
const BlogForm = memo(({
  editMode,
  currentPost,
  resetForm,
  fetchPosts,
  isViewer,
}) => {
  const dispatch = useDispatch();
  const admin = useAdminState();
  const [loading, setLoading] = useState(false);
  // Redux state for categories, form state, file/image state, and UI state

  const categories = useSelector((state) => state.admin.blogCategories);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    summary: "",
    image_url: "",
    is_published: false,
    categoryIds: [],
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const contentTextareaRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [attachedImages, setAttachedImages] = useState([]);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const attachedImageInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [continueCallback, setContinueCallback] = useState(null);

  // Style object for disabling form fields in viewer mode
  const disabledStyle = useMemo(() => ({
    opacity: 0.6,
    cursor: "not-allowed",
  }), []);

  // Message shown if user is only allowed to view (not edit)
  const viewerMessage = useMemo(() => isViewer ? (
    <div
      style={{
        backgroundColor: "rgba(255, 235, 205, 0.8)",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        textAlign: "center",
        border: "1px solid #f8d7a6",
        fontWeight: "bold",
      }}
    >
      لا يمكنك تعديل أو إضافة مقالات. يمكنك فقط الاطلاع على النموذج.
    </div>
  ) : null, [isViewer]);

useEffect(() => {
  const handleUnsavedChanges = (e) => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
      setContinueCallback(() => e.detail.onContinue);
    } else {
      e.detail.onContinue();
    }
  };
  // Listen for custom event to check for unsaved changes before navigation
  window.addEventListener("checkUnsavedChanges", handleUnsavedChanges);
  return () => {
    window.removeEventListener("checkUnsavedChanges", handleUnsavedChanges);
  };
}, [hasUnsavedChanges]);

useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      const message = 'لديك تغييرات غير محفوظة. إذا غادرت الصفحة الآن، قد تبقى بعض الصور أو المرفقات ولن يتم حذفها تلقائيًا.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [hasUnsavedChanges]);

  useEffect(() => {
    if (editMode && currentPost) {
      // Populate form fields with existing post data
      setFormData({
        title: currentPost.title || "",
        slug: currentPost.slug || "",
        content: currentPost.content || "",
        summary: currentPost.summary || "",
        image_url: currentPost.image_url || "",
        is_published: currentPost.is_published || false,
        categoryIds: currentPost.categories?.map((cat) => cat.id) || [],
      });

      if (currentPost.image_url) {
        setImagePreview(currentPost.image_url);
      }
    }
  }, [editMode, currentPost]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        setShowExitDialog(true);
        e.preventDefault();
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleUnsavedChanges = (e) => {
      if (hasUnsavedChanges) {
        setShowExitDialog(true);
        setContinueCallback(() => e.detail.onContinue);
      } else {
        e.detail.onContinue();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("checkUnsavedChanges", handleUnsavedChanges);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("checkUnsavedChanges", handleUnsavedChanges);
    };
  }, [hasUnsavedChanges]);

  // Load attached images when editing an existing post
  useEffect(() => {
    if (editMode && currentPost) {
      const existingAttachments = currentPost.attachments || [];
      setAttachedImages(
        existingAttachments.map((attachment) => ({
          url: attachment.url,
          name: attachment.name,
          path: attachment.path,
        }))
      );
    }
  }, [editMode, currentPost]);

  // Handle input changes for all form fields and category checkboxes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "categoryIds") {
      const categoryId = e.target.value;
      const updatedCategoryIds = [...formData.categoryIds];

      if (checked) {
        updatedCategoryIds.push(categoryId);
      } else {
        const index = updatedCategoryIds.indexOf(categoryId);
        if (index !== -1) {
          updatedCategoryIds.splice(index, 1);
        }
      }

      setFormData({
        ...formData,
        categoryIds: updatedCategoryIds,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }

    setHasUnsavedChanges(true);

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  // Handle click on main or attached image (either open viewer or trigger file input)
  const handleImageClick = useCallback((image = null) => {
    if (image) {
      setSelectedImage(image);
      setShowImageViewer(true);
    } else {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  }, []);

  // Handle change of main blog image (validates and previews image)
  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      dispatch(
        showToast({
          message: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF, WEBP)",
          type: "error",
        })
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      dispatch(
        showToast({
          message: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
          type: "error",
        })
      );
      return;
    }
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setHasUnsavedChanges(true);
  }, [dispatch]);

  // Validate required fields and slug format before submit
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان المقالة مطلوب";
    }

    if (!formData.content.trim()) {
      newErrors.content = "محتوى المقالة مطلوب";
    }

    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!formData.slug.trim()) {
      newErrors.slug = "الرابط المختصر مطلوب";
    } else if (!slugRegex.test(formData.slug)) {
      newErrors.slug =
        "الرابط المختصر يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate a URL-friendly slug from the title
  const generateSlug = useCallback(() => {
    if (!formData.title) return;
    const slug = formData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
    setFormData({ ...formData, slug });
  }, [formData.title]);

  // Remove image from Supabase storage bucket
  const deleteImageFromStorage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
      // Extract the path from the URL (format is typically: https://[domain]/storage/v1/object/public/[bucket]/[path])
      const urlParts = imageUrl.split("/");
      // Get the path after the bucket name (site-images)
      const storageIndex = urlParts.indexOf("site-images");
      if (storageIndex === -1) return;

      const filePath = urlParts.slice(storageIndex + 1).join("/");

      if (filePath) {
        const { error } = await supabase.storage
          .from("site-images")
          .remove([filePath]);

        if (error) {
          // console.error("Error deleting image from storage:", error);
        } else {
          // console.log("Image deleted successfully from storage:", filePath);
        }
      }
    } catch (error) {
      // console.error("Error processing image deletion:", error);
    }
  };

  // Handle upload of an attached image (not main image), insert markdown, and update state
  const handleAttachImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      dispatch(
        showToast({
          message: "يرجى اختيار ملف صورة صالح (JPG, PNG, GIF, WEBP)",
          type: "error",
        })
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(
        showToast({
          message: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت",
          type: "error",
        })
      );
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(50);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      const { data: publicURLData } = supabase.storage
        .from("site-images")
        .getPublicUrl(filePath);

      const newImage = {
        url: publicURLData.publicUrl,
        name: file.name,
        path: filePath,
      };

      const newAttachedImages = [...attachedImages, newImage];
      setAttachedImages(newAttachedImages);
      setHasUnsavedChanges(true);

      if (contentTextareaRef.current) {
        const position = contentTextareaRef.current.selectionStart;
        const currentContent = formData.content;
        const imageMarkdown = `![${file.name}](${publicURLData.publicUrl})`;

        const newContent =
          currentContent.substring(0, position) +
          imageMarkdown +
          currentContent.substring(position);

        setFormData({
          ...formData,
          content: newContent,
        });
      }

      dispatch(
        showToast({
          message: "تم رفع الصورة بنجاح",
          type: "success",
        })
      );
    } catch (error) {
      // console.error("Error uploading image:", error);
      dispatch(
        showToast({
          message: "حدث خطأ أثناء رفع الصورة",
          type: "error",
        })
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (attachedImageInputRef.current) {
        attachedImageInputRef.current.value = "";
      }
    }
  };

  // Remove an attached image from storage and content markdown
  const handleRemoveAttachedImage = async (imageToRemove) => {
    if (!imageToRemove.path) {
      // console.error("No path found for image to remove");
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeleteProgress(50);

      const { error } = await supabase.storage
        .from("site-images")
        .remove([imageToRemove.path]);

      if (error) throw error;

      const newAttachedImages = attachedImages.filter(
        (img) => img.url !== imageToRemove.url
      );
      setAttachedImages(newAttachedImages);

      setDeleteProgress(100);

      const newContent = formData.content.replace(
        `![${imageToRemove.name}](${imageToRemove.url})`,
        ""
      );
      setFormData({
        ...formData,
        content: newContent,
      });

      dispatch(
        showToast({
          message: "تم حذف الصورة بنجاح",
          type: "success",
        })
      );
    } catch (error) {
      console.error("Error removing image:", error);
      dispatch(
        showToast({
          message: "حدث خطأ أثناء حذف الصورة",
          type: "error",
        })
      );
    } finally {
      setIsDeleting(false);
      setDeleteProgress(0);
    }
  };

  // Save the current form as a draft (not published)
  const handleSaveAsDraft = async () => {
    try {
      setLoading(true);

      let imageUrl = formData.image_url;
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `blog/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("site-images")
            .upload(filePath, selectedFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data: publicURLData } = supabase.storage
            .from("site-images")
            .getPublicUrl(filePath);

          imageUrl = publicURLData.publicUrl;
        } catch (error) {
          console.error("Error handling image:", error);
          throw new Error("فشل في معالجة الصورة");
        }
      }

      await handleSubmit(null, true, imageUrl);

      if (continueCallback && !showExitDialog) {
        continueCallback();
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      dispatch(
        showToast({
          message: `حدث خطأ أثناء حفظ المسودة: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Discard all unsaved changes and clean up uploaded images
  const handleDiscardChanges = async () => {
    if (imagePreview && selectedFile) {
      await deleteImageFromStorage(formData.image_url);
      setImagePreview("");
      setSelectedFile(null);
    }
    if (attachedImages && attachedImages.length > 0) {
      for (const img of attachedImages) {
        if (img.path) {
          await deleteImageFromStorage(img.url);
        }
      }
      setAttachedImages([]);
    }
    setShowExitDialog(false);
    setHasUnsavedChanges(false);
    if (continueCallback && !showExitDialog) {
      continueCallback();
    }
  };

  // Main submit handler for creating or updating a blog post
  // Handles image upload, validation, and sending data to Supabase
  const handleSubmit = async (e, isDraft = false, draftImageUrl = null) => {
    if (e) e.preventDefault();
    if (loading) return;

    if (!isDraft && !validateForm()) {
      dispatch(
        showToast({
          message: "يرجى تصحيح الأخطاء قبل الحفظ",
          type: "error",
        })
      );
      return;
    }

    try {
      setLoading(true);

      let newImageUrl = draftImageUrl;
      if (!isDraft && selectedFile) {
        try {
          const fileExt = selectedFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `blog/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("site-images")
            .upload(filePath, selectedFile, {
              cacheControl: "3600",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const { data: publicURLData } = supabase.storage
            .from("site-images")
            .getPublicUrl(filePath);

          newImageUrl = publicURLData.publicUrl;

          if (editMode && currentPost?.image_url) {
            await deleteImageFromStorage(currentPost.image_url);
          }
        } catch (error) {
          // console.error("Error handling image:", error);
          throw new Error("فشل في معالجة الصورة");
        }
      } else if (!selectedFile) {
        newImageUrl = formData.image_url;
      }

      const postData = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        summary: formData.summary,
        image_url: newImageUrl,
        is_published: isDraft ? false : formData.is_published,
        updated_at: new Date().toISOString(),
        published_at: isDraft
          ? null
          : formData.is_published
          ? new Date().toISOString()
          : editMode && currentPost?.published_at
          ? currentPost.published_at
          : null,
        attachments: attachedImages,
      };

      let postId;
      if (editMode) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", currentPost.id);

        if (updateError) throw updateError;
        postId = currentPost.id;
      } else {
        const { data: newPost, error: insertError } = await supabase
          .from("blog_posts")
          .insert({ ...postData, author_id: admin?.id })
          .select()
          .single();

        if (insertError) throw insertError;
        postId = newPost.id;
      }

      if (postId) {
        if (editMode) {
          const { error: deleteError } = await supabase
            .from("blog_posts_categories")
            .delete()
            .eq("post_id", postId);

          if (deleteError) throw deleteError;
        }

        if (formData.categoryIds && formData.categoryIds.length > 0) {
          const categoryData = formData.categoryIds.map((categoryId) => ({
            post_id: postId,
            category_id: categoryId,
          }));

          const { error: categoriesError } = await supabase
            .from("blog_posts_categories")
            .insert(categoryData);

          if (categoriesError) throw categoriesError;
        }
      }

      dispatch(
        showToast({
          message: isDraft ? "تم حفظ المسودة بنجاح" : "تم حفظ المقالة بنجاح",
          type: "success",
        })
      );

      setHasUnsavedChanges(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      // console.error("Error saving post:", error);
      dispatch(
        showToast({
          message: `حدث خطأ أثناء حفظ المقالة: ${error.message}`,
          type: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Remove the main blog image from preview and form state
  const removeImage = () => {
    setImagePreview("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (editMode && currentPost?.image_url) {
      setFormData({
        ...formData,
        image_url: "",
      });
      setHasUnsavedChanges(true);
    }
  };

  // Insert markdown syntax at cursor position in content textarea
  const insertMarkdown = (type) => {
    if (contentTextareaRef.current) {
      const start = contentTextareaRef.current.selectionStart;
      const end = contentTextareaRef.current.selectionEnd;
      const selectedText = contentTextareaRef.current.value.substring(
        start,
        end
      );

      let newContent = "";
      let cursorOffset = 0;

      switch (type) {
        case "heading1":
          newContent = `# ${selectedText}`;
          if (!selectedText) cursorOffset = 2;
          break;
        case "heading2":
          newContent = `## ${selectedText}`;
          if (!selectedText) cursorOffset = 3;
          break;
        case "heading3":
          newContent = `### ${selectedText}`;
          if (!selectedText) cursorOffset = 4;
          break;
        case "bold":
          newContent = `**${selectedText}**`;
          if (!selectedText) cursorOffset = 2;
          break;
        case "italic":
          newContent = `*${selectedText}*`;
          if (!selectedText) cursorOffset = 1;
          break;
        case "unorderedList":
          newContent = `- ${selectedText}`;
          if (!selectedText) cursorOffset = 2;
          break;
        case "orderedList":
          newContent = `1. ${selectedText}`;
          if (!selectedText) cursorOffset = 3;
          break;
        case "link":
          newContent = `[${selectedText || "نص الرابط"}](https://example.com)`;
          if (!selectedText) cursorOffset = 10;
          break;
        case "image":
          newContent = `![${
            selectedText || "وصف الصورة"
          }](https://example.com/image.jpg)`;
          if (!selectedText) cursorOffset = 11;
          break;
        case "quote":
          newContent = `> ${selectedText}`;
          if (!selectedText) cursorOffset = 2;
          break;
        case "horizontalRule":
          newContent = `\n---\n${selectedText}`;
          break;
        case "code":
          newContent = `\`${selectedText}\``;
          if (!selectedText) cursorOffset = 1;
          break;
        case "codeBlock":
          newContent = `\`\`\`\n${selectedText}\n\`\`\``;
          if (!selectedText) cursorOffset = 4;
          break;
        default:
          newContent = selectedText;
      }

      const newText =
        contentTextareaRef.current.value.substring(0, start) +
        newContent +
        contentTextareaRef.current.value.substring(end);

      setFormData({
        ...formData,
        content: newText,
      });

      // Clear error when field is edited
      if (errors.content) {
        setErrors({ ...errors, content: null });
      }

      // Set focus back to textarea and position cursor appropriately
      setTimeout(() => {
        contentTextareaRef.current.focus();
        if (!selectedText && cursorOffset > 0) {
          const newPosition = start + newContent.length - cursorOffset;
          contentTextareaRef.current.setSelectionRange(
            newPosition,
            newPosition
          );
        } else {
          const newPosition = start + newContent.length;
          contentTextareaRef.current.setSelectionRange(
            newPosition,
            newPosition
          );
        }
      }, 0);
    }
  };

  // Render the blog post form UI
  return (
    <div className={`blog-form ${styles["blog-form"]}`}>
      <h2 className={styles["form-title"]}>
        {editMode ? "تعديل المقالة" : "إضافة مقالة جديدة"}
      </h2>

      {viewerMessage}

      <Suspense fallback={<div>جاري تحميل الصورة...</div>}>
        {showImageViewer && selectedImage && (
          <ImageViewer image={selectedImage} onClose={() => setShowImageViewer(false)} />
        )}
      </Suspense>

      {showExitDialog && (
        <div className={styles["exit-dialog-overlay"]}>
          <div className={styles["exit-dialog"]}>
            <h3>هل تريد حفظ التغييرات؟</h3>
            <p>لديك تغييرات غير محفوظة. ماذا تريد أن تفعل؟</p>
            <div className={styles["exit-dialog-buttons"]}>
              <button
                onClick={handleSaveAsDraft}
                className={styles["save-draft-button"]}
                disabled={loading}
              >
                حفظ كمسودة
              </button>
              <button
                onClick={handleDiscardChanges}
                className={styles["discard-button"]}
                disabled={loading}
              >
                تجاهل التغييرات
              </button>
              <button
                onClick={() => setShowExitDialog(false)}
                className={styles["cancel-button"]}
                disabled={loading}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles["form-group"]}>
          <label htmlFor="title">العنوان *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={styles["form-control"]}
            placeholder="أدخل عنوان المقالة"
            disabled={isViewer}
            style={isViewer ? disabledStyle : {}}
          />
          {errors.title && (
            <div className={styles["error-text"]}>{errors.title}</div>
          )}
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="slug">الرابط المختصر *</label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className={styles["form-control"]}
              placeholder="مثال: my-blog-post"
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            />
            <button
              type="button"
              onClick={generateSlug}
              className={styles["cancel-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              توليد
            </button>
          </div>
          {errors.slug && (
            <div className={styles["error-text"]}>{errors.slug}</div>
          )}
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="summary">ملخص</label>
          <textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className={`${styles["form-control"]} ${styles["form-textarea"]}`}
            style={{ minHeight: "100px", ...(isViewer ? disabledStyle : {}) }}
            placeholder="أدخل ملخصًا قصيرًا للمقالة"
            disabled={isViewer}
          />
        </div>

        <div className={styles["form-group"]}>
          <label>صورة المقالة</label>
          <div className={styles["image-upload-container"]}>
            {imagePreview ? (
              <div className={styles["image-preview-container"]}>
                <img
                  src={imagePreview}
                  alt="معاينة الصورة"
                  className={styles["image-preview"]}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className={styles["remove-image-button"]}
                  disabled={isViewer}
                  style={isViewer ? { display: "none" } : {}}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ) : (
              <div
                className={styles["image-upload-placeholder"]}
                onClick={() => !isViewer && handleImageClick()}
                style={
                  isViewer
                    ? { ...disabledStyle, cursor: "default" }
                    : { cursor: "pointer" }
                }
              >
                <i className="fas fa-image"></i>
                <span>انقر لإضافة صورة</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={isViewer}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label>الصور المرفقة</label>
          <div className={styles["attached-images-container"]}>
            {attachedImages.map((image) => (
              <div key={image.url} className={styles["attached-image"]}>
                <img
                  src={image.url}
                  alt={image.name}
                  onClick={() => handleImageClick(image)}
                  className={styles["attached-image-preview"]}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttachedImage(image)}
                  className={styles["remove-attached-image-button"]}
                  disabled={isViewer || isDeleting}
                  style={isViewer ? { display: "none" } : {}}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
            <Suspense fallback={<div>جاري التحميل...</div>}>
              {isUploading && (
                <ProgressBar
                  progress={uploadProgress}
                  message="جارِ رفع الصورة..."
                />
              )}
              {isDeleting && (
                <ProgressBar
                  progress={deleteProgress}
                  message="جارِ حذف الصورة..."
                />
              )}
            </Suspense>
            <div
              className={styles["image-upload-placeholder"]}
              onClick={
                isViewer || isUploading
                  ? null
                  : () => attachedImageInputRef.current.click()
              }
              style={
                isViewer || isUploading
                  ? { ...disabledStyle, cursor: "default" }
                  : {}
              }
            >
              <i className="fas fa-image"></i>
              <span>انقر لإضافة صورة</span>
              <input
                type="file"
                ref={attachedImageInputRef}
                onChange={handleAttachImage}
                accept="image/*"
                style={{ display: "none" }}
                disabled={isViewer || isUploading}
              />
            </div>
          </div>
        </div>

        <div className={styles["form-group"]}>
          <label htmlFor="content">المحتوى * (يدعم Markdown)</label>
          <div className={styles["markdown-toolbar"]}>
            <button
              type="button"
              title="عنوان كبير"
              onClick={() => insertMarkdown("heading1")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-heading"></i> 1
            </button>
            <button
              type="button"
              title="عنوان متوسط"
              onClick={() => insertMarkdown("heading2")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-heading"></i> 2
            </button>
            <button
              type="button"
              title="عنوان صغير"
              onClick={() => insertMarkdown("heading3")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-heading"></i> 3
            </button>
            <span className={styles["separator"]}></span>
            <button
              type="button"
              title="نص غامق"
              onClick={() => insertMarkdown("bold")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-bold"></i>
            </button>
            <button
              type="button"
              title="نص مائل"
              onClick={() => insertMarkdown("italic")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-italic"></i>
            </button>
            <span className={styles["separator"]}></span>
            <button
              type="button"
              title="قائمة نقطية"
              onClick={() => insertMarkdown("unorderedList")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-list-ul"></i>
            </button>
            <button
              type="button"
              title="قائمة رقمية"
              onClick={() => insertMarkdown("orderedList")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-list-ol"></i>
            </button>
            <span className={styles["separator"]}></span>
            <button
              type="button"
              title="رابط"
              onClick={() => insertMarkdown("link")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-link"></i>
            </button>
            <button
              type="button"
              title="صورة"
              onClick={() => insertMarkdown("image")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-image"></i>
            </button>
            <span className={styles["separator"]}></span>
            <button
              type="button"
              title="اقتباس"
              onClick={() => insertMarkdown("quote")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-quote-right"></i>
            </button>
            <button
              type="button"
              title="فاصل"
              onClick={() => insertMarkdown("horizontalRule")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-minus"></i>
            </button>
            <button
              type="button"
              title="نص برمجي"
              onClick={() => insertMarkdown("code")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-code"></i>
            </button>
            <button
              type="button"
              title="كتلة كود برمجي"
              onClick={() => insertMarkdown("codeBlock")}
              className={styles["markdown-button"]}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-file-code"></i>
            </button>
            <button
              type="button"
              title="معاينة المارك داون"
              onClick={() => setShowPreview(!showPreview)}
              className={`${styles["markdown-button"]} ${
                showPreview ? styles["active"] : ""
              }`}
              disabled={isViewer}
              style={isViewer ? disabledStyle : {}}
            >
              <i className="fas fa-eye"></i>
            </button>
          </div>
          <div className={styles["markdown-info"]}>
            <p>
              يمكنك استخدام Markdown لتنسيق المحتوى أو استخدام الأزرار أعلاه.
            </p>
          </div>

          <div className={styles["content-area"]}>
            <div className={styles["tabs"]}>
              <button
                type="button"
                className={`${styles["tab-button"]} ${
                  !showPreview ? styles["active"] : ""
                }`}
                onClick={() => setShowPreview(false)}
              >
                التحرير
              </button>
              <button
                type="button"
                className={`${styles["tab-button"]} ${
                  showPreview ? styles["active"] : ""
                }`}
                onClick={() => setShowPreview(true)}
              >
                معاينة
              </button>
            </div>

            {showPreview ? (
              <div className={styles["preview"]}>
                <Markdown>{formData.content}</Markdown>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                ref={contentTextareaRef}
                value={formData.content}
                onChange={handleChange}
                className={`${styles["form-control"]} ${styles["form-textarea"]}`}
                style={{
                  minHeight: "300px",
                  ...(isViewer ? disabledStyle : {}),
                }}
                placeholder="أدخل محتوى المقالة باستخدام Markdown"
                disabled={isViewer}
              />
            )}
          </div>
          {errors.content && (
            <div className={styles["error-text"]}>{errors.content}</div>
          )}
        </div>

        <div className={styles["form-group"]}>
          <label>التصنيفات</label>
          <div className={styles["categories-container"]}>
            {categories.map((category) => (
              <div key={category.id} className={styles["category-checkbox"]}>
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  name="categoryIds"
                  value={category.id}
                  checked={formData.categoryIds.includes(category.id)}
                  onChange={handleChange}
                  disabled={isViewer}
                />
                <label htmlFor={`category-${category.id}`}>
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles["form-group"]}>
          <div className={styles["publish-checkbox"]}>
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={formData.is_published}
              onChange={handleChange}
              disabled={isViewer}
            />
            <label htmlFor="is_published">نشر المقالة</label>
          </div>
        </div>

        <div className={styles["form-buttons"]}>
          <button
            type="button"
            onClick={resetForm}
            className={styles["cancel-button"]}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className={styles["submit-button"]}
            disabled={loading || isViewer}
            style={isViewer ? disabledStyle : {}}
          >
            {loading ? "جاري الحفظ..." : "حفظ المقالة"}
          </button>
        </div>
      </form>
    </div>
  );
});

// Export the BlogForm component
export default BlogForm;
