import React from "react";
import { Link } from "react-router-dom";
import styles from "../../style/CommonPages.module.css";

const Sitemap = () => {
  const siteStructure = [
    {
      title: "الصفحات الرئيسية",
      links: [
        { name: "الصفحة الرئيسية", path: "/" },
        { name: "من نحن", path: "/about" },
        { name: "اتصل بنا", path: "/contact" },
      ],
    },
    {
      title: "الخدمات والأطباء",
      links: [
        { name: "خدماتنا", path: "/services" },
        { name: "الأطباء", path: "/doctors" },
        { name: "حجز موعد", path: "/booking" },
      ],
    },
    {
      title: "المحتوى والمعلومات",
      links: [
        { name: "المدونة", path: "/blog" },
        { name: "سياسة الخصوصية", path: "/privacy-policy" },
        { name: "الشروط والأحكام", path: "/terms" },
      ],
    },
    {
      title: "حسابي",
      links: [
        { name: "تسجيل الدخول", path: "/login" },
        { name: "إنشاء حساب", path: "/register" },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>خريطة الموقع</h1>
      </div>

      <div className={`${styles.content} ${styles.sitemapGrid}`}>
        {siteStructure.map((section, index) => (
          <div key={index} className={styles.sitemapSection}>
            <h2 className={styles.sitemapTitle}>{section.title}</h2>
            <ul className={styles.sitemapList}>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <Link to={link.path} className={styles.sitemapLink}>
                    <i className="fas fa-angle-left"></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sitemap;
