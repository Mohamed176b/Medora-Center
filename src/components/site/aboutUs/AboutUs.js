import React, { useEffect, useState } from "react";
import WhoWe from "./WhoWe";
import Vision from "./Vision";
import AboutStatistics from "./AboutStatistics";
import { Link } from "react-router-dom";
import "../../../style/AboutUs.css";
import Loader from "../../common/Loader";
import DoctorCard from "../../common/DoctorCard";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorsData, fetchHomeCntent, fetchAboutContent } from "../../../redux/slices/siteDataSlice";
const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];
  const aboutData = useSelector((state) => state.siteData?.aboutContent) || [];
  const homeData = useSelector((state) => state.siteData?.homeContent) || [];

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoading(true);
        dispatch(fetchDoctorsData());
      } catch (error) {
        console.error("Error loading doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!doctors || doctors.length === 0) {
      loadDoctors();
    } else {
      setLoading(false);
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
    };

    if (!homeData || homeData.length === 0) {
      loadHome();
    } else {
      setLoading(false);
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
    };

    if (!aboutData || aboutData.length === 0) {
      loadAbout();
    } else {
      setLoading(false);
    }

  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="about-us-page">
      {/* 1. Who We Are Section */}
      <WhoWe
        shortHistory={aboutData?.short_history || ""}
        centerImageUrl={aboutData?.center_image_url || ""}
      />

      {/* 2. Vision and Mission Section */}
      <Vision
        longTermGoal={aboutData?.long_term_goal || ""}
        missionStatement={aboutData?.mission_statement || ""}
      />

      {/* 3. Medical Team Section */}
      <section className="medical-team-section">
        <div className="container">
          <h2 className="section-title">الفريق الطبي</h2>
          <div className="doctors-grid">
            {doctors && doctors.length > 0 ? (
              doctors.map((doctor) => (
                <DoctorCard
                  key={doctor.id}
                  doctor={{
                    ...doctor,
                    full_name: doctor.name || doctor.full_name || "",
                    specialization:
                      doctor.specialty || doctor.specialization || "",
                  }}
                />
              ))
            ) : (
              <p>لا يوجد أطباء لعرضهم حالياً</p>
            )}
          </div>
          <div className="view-all-doctors">
            <Link to="/doctors" className="view-all-button">
              عرض جميع الأطباء
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Statistics Section */}
      <AboutStatistics
        yearsExperience={homeData?.years_experience || 0}
        patientsCount={aboutData?.patients_served_count || 0}
        doctorsCount={aboutData?.doctors_count || 0}
        departmentsCount={aboutData?.departments_count || 0}
      />
    </div>
  );
};

export default AboutUs;
