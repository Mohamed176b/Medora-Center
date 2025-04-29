import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../supabase/supabaseClient";
import { trackPostView } from "../../../utils/blogViewsService";
import Markdown from "react-markdown";
import Loader from "../../common/Loader";
import styles from "../../../style/Blog.module.css";
import { useNavigate } from "react-router-dom";

const BlogDetail = React.memo(() => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("blog_posts")
          .select(
            `
            *,
            author:author_id(full_name, email),
            categories:blog_posts_categories(
              category:category_id(id, name, slug)
            )
          `
          )
          .eq("slug", slug)
          .eq("is_published", true)
          .single();

        if (error) throw error;

        if (data) {
          const transformedPost = {
            ...data,
            categories: data.categories.map((category) => category.category),
          };
          setPost(transformedPost);
          await trackPostView(data.id);
        } else {
          setError("لم يتم العثور على المدونة");
        }
      } catch (error) {
        setError("حدث خطأ أثناء تحميل المدونة");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !post) {
    return (
      <div className={styles["blog-detail-container"]}>
        <div className={styles["no-posts"]}>
          <i className="fas fa-exclamation-circle"></i>
          <h2>{error || "لم يتم العثور على المدونة"}</h2>
          <p>نعتذر، لا يمكن العثور على المنشور المطلوب.</p>
          <Link to="/blog" className={styles["back-to-blogs"]} dir="ltr">
            <i className="fas fa-arrow-left"></i> العودة إلى المدونة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["blog-detail-container"]}>
      <Link to="/blog" className={styles["back-to-blogs"]}>
        <i className="fas fa-arrow-left"></i> العودة إلى المدونة
      </Link>

      <div className={styles["blog-detail-header"]}>
        <h1>{post.title}</h1>

        <div className={styles["blog-detail-meta"]}>
          <div className={styles["blog-detail-date"]}>
            <i className="far fa-calendar-alt"></i>{" "}
            {formatDate(post.published_at)}
          </div>
          {post.categories.slice(0, 2).map((category) => (
            <div
              key={category.id}
              className={styles["blog-detail-category"]}
              onClick={() => {
                navigate(`/blog/category/${category.id}`);
              }}
            >
              <i className="fas fa-tag"></i>
              {category.name}
            </div>
          ))}
        </div>
      </div>

      {post.image_url && (
        <div className={styles["blog-detail-image"]}>
          <img src={post.image_url} alt={post.title} />
        </div>
      )}

      <div className={styles["blog-detail-content"]}>
        <Markdown
          components={{
            code: ({ node, inline, className, children, ...props }) => {
              return (
                <code className={className} dir="ltr" {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ node, children, ...props }) => {
              return (
                <pre dir="ltr" {...props}>
                  {children}
                </pre>
              );
            },
          }}
        >
          {post.content}
        </Markdown>
      </div>
    </div>
  );
});

export default BlogDetail;
