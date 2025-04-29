import React, { memo } from "react";
import styles from "../../../style/Blog.module.css";

const BlogSection = memo(({ topBlogPosts, handleBlogPost, handleBlogCategory, handleViewAllBlog }) => (
  <section className="blog-section">
    <div className="section-header">
      <h2>المدونة الطبية</h2>
      <p>أحدث المقالات والنصائح الطبية</p>
    </div>
    <div className={styles["blog-grid"]}>
      {topBlogPosts.map((post) => (
        <div key={post.id} className={styles["blog-card"]}>
          {post.image_url && (
            <div className={styles["blog-card-img-container"]}>
              <img
                src={post.image_url || null}
                alt={post.title}
                className={styles["blog-card-img"]}
                loading="lazy"
              />
            </div>
          )}
          <div className={styles["blog-card-content"]}>
            <h2 className={styles["blog-card-title"]}>{post.title}</h2>
            <div className={styles["blog-card-meta"]}>
              <span className={styles["blog-card-date"]}>
                <i className="far fa-calendar-alt"></i>
                {new Date(post.published_at).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              {post.categories?.length > 0 && (
                <div className={styles["blog-categories"]}>
                  {post.categories.slice(0, 2).map((categoryRelation) => (
                    <span
                      key={categoryRelation.category.id}
                      className={styles["blog-card-category"]}
                      onClick={() => handleBlogCategory(categoryRelation.category.id)}
                    >
                      <i className="fas fa-tag"></i>
                      {categoryRelation.category.name}
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
            <button
              onClick={() => handleBlogPost(post.slug)}
              className={styles["read-more"]}
            >
              اقرأ المزيد <i className="fas fa-arrow-left"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
    <button className="view-all-button" onClick={handleViewAllBlog}>
      قراءة المزيد من المقالات
    </button>
  </section>
));


export default BlogSection;
