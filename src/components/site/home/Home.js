import React, { useState, useEffect, useMemo, useCallback } from "react";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import DoctorsSection from "./DoctorsSection";
import BlogSection from "./BlogSection";
import TestimonialsSection from "./TestimonialsSection";
import ContactSection from "./ContactSection";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../../../style/Home.css";
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

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const Home = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const services = useSelector((state) => state.siteData?.servicesData) || [];
  const contactInfo = useSelector((state) => state.siteData?.contactData) || [];
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];
  const aboutData = useSelector((state) => state.siteData?.aboutContent) || [];
  const homeData = useSelector((state) => state.siteData?.homeContent) || [];
  const testimonialsData =
    useSelector((state) => state.siteData?.testimonialsData) || [];
  const allBlogData = useSelector((state) => state.siteData?.allBlogData) || [];
  const handleViewAllServices = useCallback(() => navigate("/services"), [navigate]);
  const handleViewAllDoctors = useCallback(() => navigate("/doctors"), [navigate]);
  const handleViewAllBlog = useCallback(() => navigate("/blog"), [navigate]);
  const handleBooking = useCallback(() => navigate("/booking"), [navigate]);
  const handleContact = useCallback(() => navigate("/contact"), [navigate]);
  const handleBlogCategory = useCallback((id) => navigate(`/blog/category/${id}`), [navigate]);
  const handleBlogPost = useCallback((slug) => navigate(`/blog/${slug}`), [navigate]);
  const topServices = useMemo(() => services.slice(0, 3), [services]);
  const topDoctors = useMemo(() => doctors.slice(0, 3), [doctors]);
  const topBlogPosts = useMemo(() => allBlogData.slice(0, 4), [allBlogData]);
  const topTestimonials = useMemo(() => testimonialsData.slice(0, 4), [testimonialsData]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        dispatch(fetchServicesData());
      } catch (error) {
        // console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        dispatch(fetchContactData());
      } catch (error) {
        // console.error("Error loading contact:", error);
      } finally {
        setLoading(false);
      }
    };

    async function loadDoctors() {
      try {
        setLoading(true);
        dispatch(fetchDoctorsData());
      } catch (error) {
        // console.error("Error loading doctors:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadHome() {
      try {
        setLoading(true);
        dispatch(fetchHomeCntent());
      } catch (error) {
        // console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadAbout() {
      try {
        setLoading(true);
        dispatch(fetchAboutContent());
      } catch (error) {
        // console.error("Error loading about data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadTestimonials() {
      try {
        setLoading(true);
        dispatch(fetchTestimonialsData());
      } catch (error) {
        // console.error("Error loading Testimonials data:", error);
      } finally {
        setLoading(false);
      }
    }

    async function loadAllBlog() {
      try {
        setLoading(true);
        dispatch(fetchAllBlogData());
      } catch (error) {
        // console.error("Error loading All Blogs data:", error);
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
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = "Medora Center";
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="home-container">
      <HeroSection homeData={homeData} />
      <AboutSection aboutData={aboutData} homeData={homeData} doctors={doctors} />
      <ServicesSection topServices={topServices} handleViewAllServices={handleViewAllServices} />
      <DoctorsSection topDoctors={topDoctors} handleViewAllDoctors={handleViewAllDoctors} />
      <BlogSection topBlogPosts={topBlogPosts} handleBlogPost={handleBlogPost} handleBlogCategory={handleBlogCategory} handleViewAllBlog={handleViewAllBlog} />
      <TestimonialsSection topTestimonials={topTestimonials} />
      <ContactSection contactInfo={contactInfo} loading={loading} handleBooking={handleBooking} handleContact={handleContact} />
    </div>
  );
};

export default Home;
