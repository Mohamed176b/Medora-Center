import React, { useState, useEffect, useMemo, useCallback } from "react";
import ServiceCard from "../../common/ServiceCard";
import styles from "../../../style/Services.module.css";
import Loader from "../../common/Loader";
import { useSelector, useDispatch } from "react-redux";
import { fetchServicesData } from "../../../redux/slices/siteDataSlice";

const Services = React.memo(() => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const servicesData =
    useSelector((state) => state.siteData?.servicesData) || [];
  const servicesList = useMemo(() => (Array.isArray(servicesData) ? servicesData : []), [servicesData]);

  const renderServices = useCallback(() => (
    servicesList.map((service) => (
      <ServiceCard key={service.id} service={service} />
    ))
  ), [servicesList]);
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
        {renderServices()}
      </div>
    </div>
  );
});

export default Services;
