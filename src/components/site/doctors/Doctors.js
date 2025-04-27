import React, { useState, useEffect } from "react";
import styles from "../../../style/Doctors.module.css";
import Loader from "../../common/Loader";
import DoctorCard from "../../common/DoctorCard";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorsData } from "../../../redux/slices/siteDataSlice";
const Doctors = () => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const doctors = useSelector((state) => state.siteData?.doctorsData) || [];

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        dispatch(fetchDoctorsData());
      } catch (error) {
        console.error("Error loading docotors:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!doctors || doctors.length === 0) {
      loadDoctors();
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className={styles["doctors-container"]}>
      <div className={styles["doctors-header"]}>
        <h1>أطباؤنا المتميزون</h1>
        <p className={styles["doctors-intro"]}>
          نفخر بتقديم نخبة من الأطباء المتخصصين والخبراء في مجالاتهم الطبية
          المختلفة. يلتزم فريقنا الطبي بتقديم أعلى مستويات الرعاية الصحية مع
          التركيز على راحة المرضى وتلبية احتياجاتهم. مع سنوات من الخبرة والتفاني
          في العمل، يضمن أطباؤنا تقديم خدمات طبية متميزة وشخصية لكل مريض.
        </p>
      </div>

      {loading ? (
        <div className={styles["doctors-loader-wrapper"]}>
          <Loader />
        </div>
      ) : doctors.length === 0 ? (
        <div className={styles["no-data"]}>لا يوجد أطباء مسجلين حالياً</div>
      ) : (
        <div className={styles["doctors-grid"]}>
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
