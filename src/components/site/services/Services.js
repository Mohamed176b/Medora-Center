import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ServiceCard from "../../common/ServiceCard";
import styles from "../../../style/Services.module.css";
import Loader from "../../common/Loader";
import { useSelector, useDispatch } from "react-redux";
import { fetchServicesData } from "../../../redux/slices/siteDataSlice";

const Services = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const servicesData =
    useSelector((state) => state.siteData?.servicesData) || [];

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        dispatch(fetchServicesData());
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!servicesData || servicesData.length === 0) {
      loadServices();
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  const handleServiceClick = () => {
    navigate("/booking");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles.servicesContainer}>
      <div className={styles.servicesHeader}>
        <h1>خدماتنا المميزة</h1>
        <p>
          نقدم لكم مجموعة متكاملة من الخدمات الطبية عالية الجودة في مركز ميدورا.
          فريقنا الطبي المتخصص يضمن لكم رعاية صحية متميزة وتجربة علاجية فريدة.
        </p>
      </div>

      <div className={styles.servicesGrid}>
        {Array.isArray(servicesData) &&
          servicesData.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={handleServiceClick}
            />
          ))}
      </div>
    </div>
  );
};

export default Services;
