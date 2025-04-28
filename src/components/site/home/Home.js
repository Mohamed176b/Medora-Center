import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ServiceCard from "../../common/ServiceCard";
import DoctorCard from "../../common/DoctorCard";
import AboutStatistics from "../aboutUs/AboutStatistics";
import "../../../style/Home.css";
import styles from "../../../style/Blog.module.css";
import Loader from "../../common/Loader";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchServicesData,
  fetchHomeCntent,
  fetchAboutContent,
  fetchTestimonialsData,
  fetchDoctorsData,
  fetchContactData,
  fetchAllBlogData,
} from "../../../redux/slices/siteDataSlice";

// Fix for leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const services = useSelector((state) => state.siteData?.servicesData) || [];
  const contactInfo = useSelector((state) => state.siteData?.contactData) || [];
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];
  const aboutData = useSelector((state) => state.siteData?.aboutContent) || [];
  const homeData = useSelector((state) => state.siteData?.homeContent) || [];
  const testimonialsData =
    useSelector((state) => state.siteData?.testimonialsData) || [];
  const allBlogData = useSelector((state) => state.siteData?.allBlogData) || [];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        dispatch(fetchServicesData());
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        dispatch(fetchContactData());
      } catch (error) {
        console.error("Error loading contact:", error);
      } finally {
        setLoading(false);
      }
    };

    async function loadDoctors() {
      try {
        setLoading(true);
        dispatch(fetchDoctorsData());
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadHome() {
      try {
        setLoading(true);
        dispatch(fetchHomeCntent());
      } catch (error) {
        console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadAbout() {
      try {
        setLoading(true);
        dispatch(fetchAboutContent());
      } catch (error) {
        console.error("Error loading about data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadTestimonials() {
      try {
        setLoading(true);
        dispatch(fetchTestimonialsData());
      } catch (error) {
        console.error("Error loading Testimonials data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadAllBlog() {
      try {
        setLoading(true);
        dispatch(fetchAllBlogData());
      } catch (error) {
        console.error("Error loading All Blogs data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!services || services.length === 0) {
      loadServices();
    } else {
      setLoading(false);
    }

    if (!contactInfo || contactInfo.length === 0) {
      fetchContactInfo();
    } else {
      setLoading(false);
    }

    if (!doctors || doctors.length === 0) {
      loadDoctors();
    } else {
      setLoading(false);
    }

    if (!homeData || homeData.length === 0) {
      loadHome();
    } else {
      setLoading(false);
    }

    if (!aboutData || aboutData.length === 0) {
      loadAbout();
    } else {
      setLoading(false);
    }

    if (!testimonialsData || testimonialsData.length === 0) {
      loadTestimonials();
    } else {
      setLoading(false);
    }

    if (!allBlogData || allBlogData.length === 0) {
      loadAllBlog();
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div
          className="hero-background"
          style={{
            backgroundImage: `url(${homeData.background_image_url})`,
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>{homeData.catchy_title}</h1>
          <p>{homeData.simple_description}</p>
        </div>
      </section>

      {/* About Section with statistics */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <h2>نبذة عن المركز</h2>
            <p>{aboutData.center_overview}</p>
            <AboutStatistics
              yearsExperience={homeData.years_experience}
              patientsCount={aboutData.patients_served_count}
              doctorsCount={doctors.length}
              departmentsCount={aboutData.departments_count}
            />
          </div>
          {aboutData.center_image_url && (
            <img
              src={aboutData.center_image_url}
              alt="مركز ميدورا الطبي"
              className="about-image"
            />
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="section-header">
          <h2>خدماتنا الطبية</h2>
          <p>نقدم مجموعة متكاملة من الخدمات الطبية بأعلى معايير الجودة</p>
        </div>
        <div className="services-grid">
          {services.slice(0, 3).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
            />
          ))}
        </div>
        <button
          className="view-all-button"
          onClick={() => navigate("/services")}
        >
          عرض جميع الخدمات
        </button>
      </section>

      {/* Doctors Section */}
      <section className="doctors-section">
        <div className="section-header">
          <h2>فريقنا الطبي</h2>
          <p>نخبة من الأطباء المتخصصين لتقديم أفضل رعاية طبية</p>
        </div>
        <div className="doctors-grid">
          {doctors.slice(0, 3).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        <button
          className="view-all-button"
          onClick={() => navigate("/doctors")}
        >
          التعرف على فريقنا الطبي
        </button>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="section-header">
          <h2>المدونة الطبية</h2>
          <p>أحدث المقالات والنصائح الطبية</p>
        </div>
        <div className={styles["blog-grid"]}>
          {allBlogData.slice(0, 4).map((post) => (
            <div key={post.id} className={styles["blog-card"]}>
              {post.image_url && (
                <div className={styles["blog-card-img-container"]}>
                  <img
                    src={post.image_url || null}
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
                          onClick={() => {
                            navigate(`/blog/category/${categoryRelation.category.id}`);
                          }}
                        >
                          <i className="fas fa-tag"></i>
                          {categoryRelation.category.name}
                        </span>
                      ))}
                      {post.categories.length > 2 && (
                        <span
                          className={styles["blog-card-category"]}
                        >
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
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className={styles["read-more"]}
                >
                  اقرأ المزيد <i className="fas fa-arrow-left"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
        <button className="view-all-button" onClick={() => navigate("/blog")}>
          قراءة المزيد من المقالات
        </button>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>من قلب التجربة</h2>
          <p>استمع لما يقوله من خاضوا رحلتهم معنا</p>
        </div>
        <div className="testimonials-container">
          {testimonialsData.slice(0, 4).map((testimonial, i) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <span>
                    {testimonial.patients?.full_name?.charAt(0) || "M"}
                  </span>
                </div>
                <div className="testimonial-info">
                  <h3>مستخدم-{i + 1}</h3>
                  <div className="testimonial-stars">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="testimonial-content">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      {contactInfo && (
        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-content">
              <h2>تواصل معنا</h2>
              <p>نحن هنا للإجابة على استفساراتك وحجز موعدك</p>
              <div className="contact-buttons">
                <button
                  className="contact-button primary-button"
                  onClick={() => navigate("/booking")}
                >
                  <i className="fas fa-calendar-plus"></i>
                  احجز موعد
                </button>
                <button
                  className="contact-button secondary-button"
                  onClick={() => navigate("/contact")}
                >
                  <i className="fas fa-envelope"></i>
                  اتصل بنا
                </button>
              </div>
              <div className="quick-links">
                {contactInfo.facebook_url && (
                  <a
                    href={contactInfo.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                )}
                {contactInfo.instagram_url && (
                  <a
                    href={contactInfo.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
                {contactInfo.x_url && (
                  <a
                    href={contactInfo.x_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link twitter"
                  >
                    <i className="fab fa-x-twitter"></i>
                  </a>
                )}
                {contactInfo.threads_url && (
                  <a
                    href={contactInfo.threads_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link threads"
                  >
                    <i className="fab fa-threads"></i>
                  </a>
                )}
              </div>
            </div>
            <div className="map-container">
              {loading || !contactInfo || contactInfo.latitude === undefined || contactInfo.longitude === undefined ? (
                <Loader />
              ) : (
                <MapContainer
                  center={[contactInfo.latitude, contactInfo.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker
                    position={[contactInfo.latitude, contactInfo.longitude]}
                  />
                </MapContainer>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
