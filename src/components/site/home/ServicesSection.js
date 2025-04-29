import React, { memo } from "react";
import ServiceCard from "../../common/ServiceCard";

const ServicesSection = memo(({ topServices, handleViewAllServices }) => (
  <section className="services-section">
    <div className="section-header">
      <h2>خدماتنا الطبية</h2>
      <p>نقدم مجموعة متكاملة من الخدمات الطبية بأعلى معايير الجودة</p>
    </div>
    <div className="services-grid">
      {topServices.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
    <button
      className="view-all-button"
      onClick={handleViewAllServices}
    >
      عرض جميع الخدمات
    </button>
  </section>
));


export default ServicesSection;
