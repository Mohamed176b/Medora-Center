import React, { memo } from "react";

const HeroSection = memo(({ homeData }) => (
  <section className="hero-section">
    <div
      className="hero-background"
      style={{ backgroundImage: `url(${homeData.background_image_url})` }}
    />
    <div className="hero-overlay" />
    <div className="hero-content">
      <h1>{homeData.catchy_title? homeData.catchy_title : "رعايتك مسؤوليتنا، وصحتك أولويتنا"}</h1>
      <p>{homeData.simple_description? homeData.simple_description : "نقدّم خدمات طبية متكاملة بأعلى معايير الجودة، على يد نخبة من الأطباء المتخصصين، لنكون دائمًا الخيار الأول لراحتك وصحتك."}</p>
    </div>
  </section>
));


export default HeroSection;
