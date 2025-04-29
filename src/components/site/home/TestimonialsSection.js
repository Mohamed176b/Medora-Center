import React, { memo } from "react";

const TestimonialsSection = memo(({ topTestimonials }) => (
  <section className="testimonials-section">
    <div className="section-header">
      <h2>من قلب التجربة</h2>
      <p>استمع لما يقوله من خاضوا رحلتهم معنا</p>
    </div>
    <div className="testimonials-container">
      {topTestimonials.map((testimonial, i) => (
        <div key={testimonial.id} className="testimonial-card">
          <div className="testimonial-header">
            <div className="testimonial-avatar">
              <span>
                {testimonial.patients?.full_name?.charAt(0) || "M"}
              </span>
            </div>
            <div className="testimonial-info">
              <h3>مستخدم-{i + 1}</h3>
              <div className="testimonial-stars">
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
          </div>
          <p className="testimonial-content">{testimonial.content}</p>
        </div>
      ))}
    </div>
  </section>
));

export default TestimonialsSection;
