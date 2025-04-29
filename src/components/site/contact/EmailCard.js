import React from "react";

const EmailCard = React.memo(({ email }) => (
  <div className="info-card">
    <div className="info-card-icon">
      <i className="fas fa-envelope"></i>
    </div>
    <div className="info-card-content">
      <h3>تواصل معنا عبر الايميل</h3>
      <p>{email}</p>
    </div>
  </div>
));

export default EmailCard;
