import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBlogData,
  fetchCategories,
} from "../../../redux/slices/siteDataSlice";
import Loader from "../../common/Loader";
import styles from "../../../style/Blog.module.css";

const BlogCategory = React.memo(() => {
  const dispatch = useDispatch();
  const allBlogData = useSelector((state) => state.siteData.allBlogData);
  const categories = useSelector((state) => state.siteData.categories);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { categoryId } = useParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!categories?.length) {
          dispatch(fetchCategories());
        }
        if (!allBlogData?.length) {
          dispatch(fetchAllBlogData());
        }
      } catch (error) {
        // console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!allBlogData?.length || !categories?.length) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [dispatch, allBlogData?.length, categories?.length]);

  const handleSearchChange = React.useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentCategory = categories.find((cat) => cat.id === categoryId);

  const filteredPosts = React.useMemo(() => {
    return allBlogData.filter((post) => {
      const matchesCategory = post.categories.some(
        (cat) => cat.category.id === categoryId
      );

      const matchesSearch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [allBlogData, categoryId, searchTerm]);

  const transformedPosts = filteredPosts.map((post) => ({
    ...post,
    categories: post.categories.map((category) => category.category),
  }));

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles["blog-container"]}>
      <div className={styles["blog-header"]}>
        <h1>{currentCategory ? currentCategory.name : "التصنيف"}</h1>
        <p>
          مقالات ونصائح طبية في{" "}
          {currentCategory ? currentCategory.name : "هذا التصنيف"}
        </p>
      </div>

      <div className={styles["blog-filters"]}>
        <div className={styles["search-container"]}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="ابحث في المقالات..."
            className={styles["search-input"]}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Link to="/blog" className={styles["back-to-blogs"]}>
          <i className="fas fa-arrow-left"></i> العودة إلى كل المقالات
        </Link>
      </div>

      <div className={styles["blog-count"]}>
        {filteredPosts.length > 0 ? (
          <p>
            <i className="fas fa-newspaper"></i> عدد المقالات:{" "}
            {filteredPosts.length}
          </p>
        ) : null}
      </div>

      <div className={styles["blog-grid"]}>
        {transformedPosts.length > 0 ? (
          transformedPosts.map((post) => (
            <div key={post.id} className={styles["blog-card"]}>
              {post.image_url && (
                <div className={styles["blog-card-img-container"]}>
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className={styles["blog-card-img"]}
                  />
                </div>
              )}
              <div className={styles["blog-card-content"]}>
                <h2 className={styles["blog-card-title"]}>{post.title}</h2>
                <div className={styles["blog-card-meta"]}>
                  <span className={styles["blog-card-date"]}>
                    <i className="far fa-calendar-alt"></i>
                    {formatDate(post.published_at)}
                  </span>
                  {post.categories?.length > 0 && (
                    <div className={styles["blog-categories"]}>
                      {post.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className={styles["blog-card-category"]}
                          onClick={() => {
                            navigate(`/blog/category/${category.id}`);
                          }}
                        >
                          <i className="fas fa-tag"></i>
                          {category.name}
                        </span>
                      ))}
                      {post.categories.length > 2 && (
                        <span className={styles["blog-card-category"]}>
                          +{post.categories.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {post.summary && (
                  <p className={styles["blog-card-excerpt"]}>{post.summary}</p>
                )}
                <Link to={`/blog/${post.slug}`} className={styles["read-more"]}>
                  اقرأ المزيد <i className="fas fa-arrow-left"></i>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className={styles["no-posts"]}>
            <i className="fas fa-exclamation-circle"></i>
            <p>لا توجد مقالات في هذا التصنيف</p>
            {searchTerm && <p>حاول تغيير كلمات البحث</p>}
          </div>
        )}
      </div>
    </div>
  );
});

export default BlogCategory;
