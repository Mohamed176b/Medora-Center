import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const ContactInfo = React.memo(({ contactInfo }) => {
  const hasSocial = useMemo(() =>
    contactInfo.facebook_url ||
    contactInfo.instagram_url ||
    contactInfo.x_url ||
    contactInfo.threads_url,
    [contactInfo]
  );

  return (
    <div className="contact-info">
      {contactInfo.phone && (
        <div className="info-card">
          <div className="info-card-icon">
            <i className="fas fa-phone"></i>
          </div>
          <div className="info-card-content">
            <h3>اتصل بنا</h3>
            <p>{contactInfo.phone}</p>
          </div>
        </div>
      )}
      {contactInfo.address && (
        <div className="info-card">
          <div className="info-card-icon">
            <i className="fa-solid fa-address-book"></i>
          </div>
          <div className="info-card-content">
            <h3>العنوان</h3>
            <p>{contactInfo.address}</p>
          </div>
        </div>
      )}
      {contactInfo.latitude && contactInfo.longitude && (
        <div className="info-card">
          <div className="info-card-icon">
            <i className="fas fa-location-dot"></i>
          </div>
          <div className="info-card-content">
            <h3>موقعنا</h3>
            <div className="map-container">
              <MapContainer
                center={[contactInfo.latitude, contactInfo.longitude]}
                zoom={15}
                style={{ height: "250px", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[contactInfo.latitude, contactInfo.longitude]} />
              </MapContainer>
            </div>
          </div>
        </div>
      )}
      {hasSocial && (
        <div className="info-card">
          <div className="info-card-icon">
            <i className="fas fa-share-nodes"></i>
          </div>
          <div className="info-card-content">
            <h3>تابعنا على</h3>
            <div className="social-links">
              {contactInfo.facebook_url && (
                <a
                  href={contactInfo.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="facebook"
                >
                  <i className="fab fa-facebook"></i>
                </a>
              )}
              {contactInfo.instagram_url && (
                <a
                  href={contactInfo.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
              )}
              {contactInfo.x_url && (
                <a
                  href={contactInfo.x_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="twitter"
                >
                  <i className="fab fa-x-twitter"></i>
                </a>
              )}
              {contactInfo.threads_url && (
                <a
                  href={contactInfo.threads_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="threads"
                >
                  <i className="fab fa-threads"></i>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default ContactInfo;
