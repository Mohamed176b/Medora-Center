import React, { useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import "../../style/Footer.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchServicesData,
  fetchContactData,
} from "../../redux/slices/siteDataSlice";
const Footer = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const dispatch = useDispatch();
  const services = useSelector((state) => state.siteData?.servicesData) || [];
  const contactInfo = useSelector((state) => state.siteData?.contactData) || [];

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        dispatch(fetchContactData());
      } catch (error) {
        // console.error("Error loading contact:", error);
      }
    };

    const fetchServices = async () => {
      try {
        dispatch(fetchServicesData());
      } catch (error) {
        // console.error("Error loading services:", error);
      }
    };
    if (!contactInfo || contactInfo.length === 0) {
      fetchContactInfo();
    }
    if (!services || services.length === 0) {
      fetchServices();
    } 

  }, [dispatch]); 

  const getIconComponent = useCallback((iconName) => {
    const cleanIconName = iconName.replace(/^fa/, "");
    const iconKey = `fa${cleanIconName}`;
    return Icons[iconKey];
  }, []);

  if (!contactInfo || !services) {
    return null; 
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section about">
          <div className="logo-section">
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              alt="Medora Center Logo"
            />
            <h2>مركز ميدورا الطبي</h2>
          </div>
          <p className="about-text">
            نحن نقدم رعاية طبية متكاملة بأعلى معايير الجودة، ونسعى دائماً لتقديم
            أفضل الخدمات الطبية لمرضانا.
          </p>

          <div className="social-media">
            {contactInfo.facebook_url && (
              <a
                href={contactInfo.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon facebook"
              >
                <i className="fab fa-facebook"></i>
              </a>
            )}
            {contactInfo.instagram_url && (
              <a
                href={contactInfo.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
            )}
            {contactInfo.x_url && (
              <a
                href={contactInfo.x_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon twitter"
              >
                <i className="fab fa-x-twitter"></i>
              </a>
            )}
            {contactInfo.threads_url && (
              <a
                href={contactInfo.threads_url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon threads"
              >
                <i className="fab fa-threads"></i>
              </a>
            )}
          </div>
        </div>

        <div className="footer-section quick-links">
          <h3>روابط سريعة</h3>
          <ul>
            <li>
              <Link to="/">
                <i className="fas fa-angle-left"></i>الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/about">
                <i className="fas fa-angle-left"></i>من نحن
              </Link>
            </li>
            <li>
              <Link to="/services">
                <i className="fas fa-angle-left"></i>خدماتنا
              </Link>
            </li>
            <li>
              <Link to="/doctors">
                <i className="fas fa-angle-left"></i>أطباؤنا
              </Link>
            </li>
            <li>
              <Link to="/contact">
                <i className="fas fa-angle-left"></i>تواصل معنا
              </Link>
            </li>
            <li>
              <Link to="/booking">
                <i className="fas fa-angle-left"></i>الحجوزات
              </Link>
            </li>
            <li>
              <Link to="/blog">
                <i className="fas fa-angle-left"></i>المدونة
              </Link>
            </li>
          </ul>
        </div>

        <div className="footer-section services">
          <h3>خدماتنا الطبية</h3>
          <ul>
            {services.slice(0, 5).map((service) => (
              <li key={service.id}>
                <Link to={"/services/" + service.slug}>
                  <FontAwesomeIcon icon={getIconComponent(service.icon)} />
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>معلومات التواصل</h3>
          <ul>
            {contactInfo.phone && (
              <li>
                <i className="fas fa-phone"></i>
                <span>{contactInfo.phone}</span>
              </li>
            )}
            {contactInfo.email && (
              <li>
                <i className="fas fa-envelope"></i>
                <a
                  href={`mailto:${contactInfo.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{contactInfo.email}</span>
                </a>
              </li>
            )}
            {contactInfo.address && (
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>{contactInfo.address}</span>
              </li>
            )}
            {contactInfo.working_hours && (
              <li>
                <i className="fas fa-clock"></i>
                <span>{contactInfo.working_hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="copyright">
            جميع الحقوق محفوظة &copy; {currentYear} مركز ميدورا الطبي
          </p>
          <div className="bottom-links">
            <Link to="/privacy-policy">سياسة الخصوصية</Link>
            <Link to="/terms">الشروط والأحكام</Link>
            <Link to="/sitemap">خريطة الموقع</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="copyright copyright-mo">
            <div>
              {" "}
              تم تصميم وتنفيذ هذا الموقع بالكامل بواسطة{" "}
              <span>
                <a
                  href="https://elshafey-portfolio.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mohamed Elshafey
                </a>
              </span>
            </div>
            <div className="note">
              ملاحظة: المركز الطبي غير موجود على أرض الواقع، والموقع هو نموذج
              لتقديم مهاراتي في تطوير الواجهة الأمامية فقط.
            </div>
            <div>
              جميع الحقوق محفوظة &copy; {currentYear}{" "}
              <span>
                <a
                  href="https://elshafey-portfolio.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mohamed Elshafey
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="copyright copyright-mo">
            <a href="https://surrealism.vercel.app/" target="_blank" rel="noopener noreferrer">
              Surrealism - دليلك لعالم الترفية
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
