import React, { memo } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import Loader from "../../common/Loader";

const ContactSection = memo(({ contactInfo, loading, handleBooking, handleContact }) => (
  contactInfo && (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-content">
          <h2>تواصل معنا</h2>
          <p>نحن هنا للإجابة على استفساراتك وحجز موعدك</p>
          <div className="contact-buttons">
            <button
              className="contact-button primary-button"
              onClick={handleBooking}
            >
              <i className="fas fa-calendar-plus"></i>
              احجز موعد
            </button>
            <button
              className="contact-button secondary-button"
              onClick={handleContact}
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
  )
));

export default ContactSection;
