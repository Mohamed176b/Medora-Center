import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../../supabase/supabaseClient";
import styles from "../../../style/ServiceDetail.module.css";
import Loader from "../../common/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";

const ServiceDetail = React.memo(() => {
  const getIconFromString = React.useCallback((iconName) => {
    if (!iconName) return null;
    const iconKey = iconName.startsWith("fa") ? iconName : `fa${iconName}`;
    return solidIcons[iconKey] || null;
  }, []);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("slug", slug)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        setService(data);
      } catch (err) {
        console.error("Error fetching service:", err);
        setError("عذراً، لم نتمكن من العثور على هذه الخدمة");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  if (loading) return <Loader />;
  if (error)
    return <div className={styles.serviceDetailContainer}>{error}</div>;
  if (!service)
    return (
      <div className={styles.serviceDetailContainer}>
        لم يتم العثور على الخدمة
      </div>
    );

  return (
    <div className={styles.serviceDetailContainer}>
      <div className={styles.serviceHeader}>
        {service.icon && (
          <div className={styles.serviceIcon}>
            <FontAwesomeIcon icon={getIconFromString(service.icon)} />
          </div>
        )}
        <h1 className={styles.serviceTitle}>{service.title}</h1>
        <div className={styles.serviceDescription}>{service.description}</div>
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            {new Date(service.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        <Link to="/services" className={styles.backButton}>
          <FontAwesomeIcon
            icon={faArrowLeft}
            style={{ marginLeft: "0.5rem" }}
          />
          العودة إلى الخدمات
        </Link>
        <Link to="/booking" className={styles.actionButton}>
          احجز موعداً لهذه الخدمة
        </Link>
      </div>
    </div>
  );
});

export default ServiceDetail;
