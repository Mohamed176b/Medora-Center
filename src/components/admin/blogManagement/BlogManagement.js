import React, { useState, useEffect } from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/BlogManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllBlogPosts,
  fetchAllBlogCategories,
} from "../../../redux/slices/adminSlice";
import BlogForm from "./BlogForm";
import BlogList from "./BlogList";
import { useCallback } from "react";
import useAdminState from "../../../hooks/useAdminState";

const BlogManagement = () => {
  const [blogViewsMap, setBlogViewsMap] = useState({});

  // Fetch blog views for all posts
  const fetchBlogViews = useCallback(async (posts) => {
    if (!posts || posts.length === 0) {
      setBlogViewsMap({});
      return;
    }
    const { data: viewsData, error } = await supabase
      .from("blog_post_views")
      .select("post_id");
    if (error) {
      setBlogViewsMap({});
      return;
    }
    const map = {};
    viewsData?.forEach((view) => {
      map[view.post_id] = (map[view.post_id] || 0) + 1;
    });
    setBlogViewsMap(map);
  }, []);
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.blogManagement
  );
  const dispatch = useDispatch();
  const admin = useAdminState();

  // Get data from Redux store
  const posts = useSelector((state) => state.admin.allBlogPosts);
  const categories = useSelector((state) => state.admin.blogCategories);
  const loading = useSelector((state) => state.admin.blogLoading);
  const error = useSelector((state) => state.admin.blogError);

  const canEdit =
    (admin?.role === "super-admin" ||
      admin?.role === "admin" ||
      admin?.role === "editor") &&
    admin?.role !== "viewer";
  const isViewer = admin?.role === "viewer";

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch data on component mount only if not already in store
  // جلب عدد المشاهدات فقط عند تغير معرفات المقالات
  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchAllBlogPosts());
    } else {
      // استخراج قائمة المعرفات فقط
      const postIds = posts.map((p) => p.id).join(',');
      fetchBlogViews(posts);
    }
    if (categories.length === 0) {
      dispatch(fetchAllBlogCategories());
    }
  }, [dispatch, posts.length, categories.length, fetchBlogViews, posts.map(p => p.id).join(",")]);

  const handleAddPost = () => {
    setCurrentPost(null);
    setEditMode(false);
    setShowForm(true);
  };

  const handleEditPost = (post) => {
    setCurrentPost(post);
    setEditMode(true);
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditMode(false);
    setCurrentPost(null);
  };

  const handleViewPost = (post) => {
    window.open(`/blog/${post.slug}`, "_blank");
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  // Filter posts based on search term, status, and category
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.summary &&
        post.summary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && post.is_published) ||
      (statusFilter === "draft" && !post.is_published);

    const matchesCategory =
      categoryFilter === "all" ||
      post.categories.some((category) => category.id === categoryFilter);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (error) {
    return <div className={styles["error-message"]}>حدث خطأ: {error}</div>;
  }

  return (
    <div className={styles["blog-management-container"]}>
      <div className={styles["blog-management-header"]}>
        <h1>إدارة المدونة</h1>
        <button 
            className={styles["add-button"]}
            onClick={handleAddPost}
            disabled={showForm}
            style={showForm ? {opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none'} : {}}
          >
            <i className="fas fa-plus"></i>
            إضافة مقالة جديدة
          </button>
      </div>

      <div className={styles["filter-bar"]}>
        <input
          type="text"
          placeholder="بحث في المقالات..."
          className={styles["search-input"]}
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <select
          className={styles["filter-select"]}
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="all">كل المقالات</option>
          <option value="published">المنشورة</option>
          <option value="draft">المسودات</option>
        </select>

        <select
          className={styles["filter-select"]}
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
        >
          <option value="all">كل التصنيفات</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <BlogForm
          editMode={editMode}
          currentPost={currentPost}
          resetForm={resetForm}
          fetchPosts={() => dispatch(fetchAllBlogPosts())}
          isViewer={isViewer}
        />
      )}

      <BlogList
        posts={filteredPosts}
        loading={loading}
        canEdit={canEdit}
        isViewer={isViewer}
        onEditPost={handleEditPost}
        fetchPosts={() => dispatch(fetchAllBlogPosts())}
        handleViewPost={handleViewPost}
        blogViewsMap={blogViewsMap}
      />
    </div>
  );
};

export default BlogManagement;
