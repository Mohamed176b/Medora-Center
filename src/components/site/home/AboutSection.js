import React, { memo } from "react";
import AboutStatistics from "../aboutUs/AboutStatistics";

const AboutSection = memo(({ aboutData, homeData, doctors }) => (
  <section className="about-section">
    <div className="about-container">
      <div className="about-content">
        <h2>نبذة عن المركز</h2>
        <p>{homeData.center_overview? homeData.center_overview : "نحن مركز طبي متكامل نسعى لتقديم أفضل الخدمات الصحية بأعلى جودة ممكنة، من خلال فريق طبي مؤهل وخبرة طويلة في مختلف التخصصات. نؤمن بأن الرعاية الصحية تبدأ من الثقة، ونعمل باستمرار على توفير بيئة علاجية مريحة وآمنة تضع صحة المرضى ورضاهم في المقام الأول. يشمل المركز عدة عيادات وتخصصات لتلبية احتياجاتكم المتنوعة، مع أحدث الأجهزة والتقنيات الطبية الحديثة."}</p>
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
          loading="lazy" 
        />
      )}
    </div>
  </section>
));


export default AboutSection;
