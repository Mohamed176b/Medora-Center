import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useRef,
} from "react";
import useAuthorization from "../../../hooks/useAuthorization";
import { PAGE_ROLES } from "../../../config/roles";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/BlogManagement.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAllBlogPosts,
  fetchAllBlogCategories,
} from "../../../redux/slices/adminSlice";
import useAdminState from "../../../hooks/useAdminState";
const BlogForm = React.lazy(() => import("./BlogForm"));
const BlogList = React.lazy(() => import("./BlogList"));

const BlogManagement = memo(() => {
  const [blogViewsMap, setBlogViewsMap] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const formRef = useRef(null);
  const { isAuthorized, unauthorizedUI } = useAuthorization(
    PAGE_ROLES.blogManagement
  );
  const dispatch = useDispatch();
  const admin = useAdminState();

  const fetchBlogViews = useCallback(async (posts) => {
    if ((!posts || posts.length === 0) && isAuthorized) {
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
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  const posts = useSelector((state) => state.admin.allBlogPosts);
  const categories = useSelector((state) => state.admin.blogCategories);
  const loading = useSelector((state) => state.admin.blogLoading);
  const error = useSelector((state) => state.admin.blogError);

  const canEdit = useMemo(
    () =>
      (admin?.role === "super-admin" ||
        admin?.role === "admin" ||
        admin?.role === "editor") &&
      admin?.role !== "viewer",
    [admin?.role]
  );

  const isViewer = useMemo(() => admin?.role === "viewer", [admin?.role]);

  useEffect(() => {
    if (!posts || posts.length === 0) {
      dispatch(fetchAllBlogPosts());
    } else {
      fetchBlogViews(posts);
    }
    if (categories.length === 0) {
      dispatch(fetchAllBlogCategories());
    }
  }, [dispatch]); //eslint-disable-line react-hooks/exhaustive-deps

  const handleAddPost = useCallback(() => {
    setCurrentPost(null);
    setEditMode(false);
    setShowForm(true);
  }, []);

  const handleEditPost = useCallback((post) => {
    setCurrentPost(post);
    setEditMode(true);
    setShowForm(true);

    requestAnimationFrame(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }else {
        // console.error("formRef.current is null or undefined");
      }
    });
  }, []);

  const resetForm = useCallback(() => {
    setShowForm(false);
    setEditMode(false);
    setCurrentPost(null);
  }, []);

  const handleViewPost = useCallback((post) => {
    window.open(`/blog/${post.slug}`, "_blank");
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleCategoryFilterChange = useCallback((e) => {
    setCategoryFilter(e.target.value);
  }, []);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
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
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  const fetchPosts = useCallback(() => {
    dispatch(fetchAllBlogPosts());
  }, [dispatch]);

  if (!isAuthorized) {
    return unauthorizedUI;
  }

  if (error) {
    return <div className={styles["error-message"]}>حدث خطأ: {error}</div>;
  }

  return (
    <div className={styles["blog-management-container"]} ref={formRef}>
      <div className={styles["blog-management-header"]}>
        <h1>إدارة المدونة</h1>
        <button
          className={styles["add-button"]}
          onClick={handleAddPost}
          disabled={showForm}
          style={
            showForm
              ? { opacity: 0.6, cursor: "not-allowed", pointerEvents: "none" }
              : {}
          }
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
          fetchPosts={fetchPosts}
          isViewer={isViewer}
        />
      )}

      <BlogList
        posts={filteredPosts}
        loading={loading}
        canEdit={canEdit}
        isViewer={isViewer}
        onEditPost={handleEditPost}
        fetchPosts={fetchPosts}
        handleViewPost={handleViewPost}
        blogViewsMap={blogViewsMap}
      />
    </div>
  );
});

BlogManagement.displayName = "BlogManagement";

export default BlogManagement;
