import React, { useEffect, useState, useMemo, useCallback } from "react";
import WhoWe from "./WhoWe";
import Vision from "./Vision";
import AboutStatistics from "./AboutStatistics";
import { Link } from "react-router-dom";
import "../../../style/AboutUs.css";
import Loader from "../../common/Loader";
import DoctorCard from "../../common/DoctorCard";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDoctorsData,
  fetchHomeCntent,
  fetchAboutContent,
} from "../../../redux/slices/siteDataSlice";
const AboutUs = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];
  const aboutData = useSelector((state) => state.siteData?.aboutContent) || [];
  const homeData = useSelector((state) => state.siteData?.homeContent) || [];
  const shortHistory = useMemo(() => aboutData?.short_history || "", [aboutData]);
  const centerImageUrl = useMemo(() => aboutData?.center_image_url || "", [aboutData]);
  const longTermGoal = useMemo(() => aboutData?.long_term_goal || "", [aboutData]);
  const missionStatement = useMemo(() => aboutData?.mission_statement || "", [aboutData]);
  const yearsExperience = useMemo(() => homeData?.years_experience || 0, [homeData]);
  const patientsCount = useMemo(() => aboutData?.patients_served_count || 0, [aboutData]);
  const doctorsCount = useMemo(() => doctors.length, [doctors]);
  const departmentsCount = useMemo(() => aboutData?.departments_count || 0, [aboutData]);
  const doctorsList = useMemo(() => (doctors && doctors.length > 0 ? doctors : []), [doctors]);

  const renderDoctors = useCallback(() => (
    doctorsList.length > 0
      ? doctorsList.slice(0,3).map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))
      : <p>لا يوجد أطباء لعرضهم حالياً</p>
  ), [doctorsList]);

  useEffect(() => {
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
        // console.error("Error loading home data:", error);
      } finally {
        setLoading(false);
      }
    }

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
        // console.error("Error loading about data:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!aboutData || aboutData.length === 0) {
      loadAbout();
    } else {
      setLoading(false);
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = "من نحن؟ | مركز ميدورا";
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="about-us-page">
      <WhoWe shortHistory={shortHistory} centerImageUrl={centerImageUrl} />
      <Vision longTermGoal={longTermGoal} missionStatement={missionStatement} />
      <section className="medical-team-section">
        <div className="container">
          <h2 className="section-title">الفريق الطبي</h2>
          <div className="doctors-grid">{renderDoctors()}</div>
          <div className="view-all-doctors">
            <Link to="/doctors" className="view-all-button">
              عرض جميع الأطباء
            </Link>
          </div>
        </div>
      </section>
      <AboutStatistics
        yearsExperience={yearsExperience}
        patientsCount={patientsCount}
        doctorsCount={doctorsCount}
        departmentsCount={departmentsCount}
      />
    </div>
  );
};

export default React.memo(AboutUs);
