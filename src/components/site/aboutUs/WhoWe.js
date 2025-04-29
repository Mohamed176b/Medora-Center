import React from "react";

const WhoWe = React.memo(({ shortHistory, centerImageUrl }) => {
  return (
    <section className="who-we-are-section">
      <div className="container">
        <h1 className="section-title">من نحن</h1>
        <div className="who-we-content">
          <div className="center-image">
            {centerImageUrl && (
              <img src={centerImageUrl} alt="مركز ميدورا الطبي" loading="lazy"/>
            )}
          </div>
          <div className="center-description">
            {shortHistory && <p>{shortHistory}</p>}
          </div>
        </div>
      </div>
    </section>
  );
});

export default WhoWe;
