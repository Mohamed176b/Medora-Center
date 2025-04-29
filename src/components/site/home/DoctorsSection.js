import React, { memo } from "react";
import DoctorCard from "../../common/DoctorCard";

const DoctorsSection = memo(({ topDoctors, handleViewAllDoctors }) => (
  <section className="doctors-section">
    <div className="section-header">
      <h2>فريقنا الطبي</h2>
      <p>نخبة من الأطباء المتخصصين لتقديم أفضل رعاية طبية</p>
    </div>
    <div className="doctors-grid">
      {topDoctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
    <button
      className="view-all-button"
      onClick={handleViewAllDoctors}
    >
      التعرف على فريقنا الطبي
    </button>
  </section>
));


export default DoctorsSection;
