import React from "react";

const Vision = ({ longTermGoal, missionStatement }) => {
  return (
    <section className="vision-mission-section">
      <div className="container">
        <h2 className="section-title">الرؤية والرسالة</h2>
        <div className="vision-mission-cards">
          <div className="vision-card card">
            <div className="card-icon">
              <i className="fas fa-eye"></i>
            </div>
            <h3 className="card-title">الرؤية</h3>
            <div className="card-content">
              {longTermGoal && <p>{longTermGoal}</p>}
            </div>
          </div>

          <div className="mission-card card">
            <div className="card-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3 className="card-title">الرسالة</h3>
            <div className="card-content">
              {missionStatement && <p>{missionStatement}</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
