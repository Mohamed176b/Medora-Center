import React, { useState, useEffect, useRef, memo } from "react";

const AboutStatistics = memo(({ yearsExperience, patientsCount, doctorsCount, departmentsCount }) => {
  const [animatedYears, setAnimatedYears] = useState(0);
  const [animatedPatients, setAnimatedPatients] = useState(0);
  const [animatedDoctors, setAnimatedDoctors] = useState(0);
  const [animatedDepartments, setAnimatedDepartments] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(sectionRef.current);
        }
      },
      {
        threshold: 0.2
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const animationDuration = 2000;
    const framesPerSecond = 60;
    const totalFrames = (animationDuration / 1000) * framesPerSecond;

    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      if (progress >= 1) {
        setAnimatedYears(yearsExperience);
        setAnimatedPatients(patientsCount);
        setAnimatedDoctors(doctorsCount);
        setAnimatedDepartments(departmentsCount);
        clearInterval(timer);
      } else {
        const easeProgress = 1 - Math.pow(1 - progress, 2);
        setAnimatedYears(Math.round(easeProgress * yearsExperience));
        setAnimatedPatients(Math.round(easeProgress * patientsCount));
        setAnimatedDoctors(Math.round(easeProgress * doctorsCount));
        setAnimatedDepartments(Math.round(easeProgress * departmentsCount));
      }
    }, 1000 / framesPerSecond);

    return () => clearInterval(timer);
  }, [
    isVisible,
    yearsExperience,
    patientsCount,
    doctorsCount,
    departmentsCount,
  ]);

  return (
    <section className="statistics-section" ref={sectionRef}>
      <div className="container">
        <h2 className="section-title">إحصائيات المركز</h2>
        <div className="statistics-grid">
          <div className="statistic-card">
            <div className="statistic-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="statistic-value">{animatedYears}</div>
            <div className="statistic-label">سنوات الخبرة</div>
          </div>

          <div className="statistic-card">
            <div className="statistic-icon">
              <i className="fas fa-user-injured"></i>
            </div>
            <div className="statistic-value">{animatedPatients}</div>
            <div className="statistic-label">المرضى المستفيدين</div>
          </div>

          <div className="statistic-card">
            <div className="statistic-icon">
              <i className="fas fa-user-md"></i>
            </div>
            <div className="statistic-value">{animatedDoctors}</div>
            <div className="statistic-label">الأطباء المتخصصين</div>
          </div>

          <div className="statistic-card">
            <div className="statistic-icon">
              <i className="fas fa-hospital-alt"></i>
            </div>
            <div className="statistic-value">{animatedDepartments}</div>
            <div className="statistic-label">الأقسام الطبية</div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutStatistics;
