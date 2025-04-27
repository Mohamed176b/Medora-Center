import React from "react";
import styles from "../../style/Common.module.css";

const ProgressBar = ({ progress, message }) => {
  return (
    <div className={styles["progress-container"]}>
      <div className={styles["progress-bar"]}>
        <div
          className={styles["progress-fill"]}
          style={{ width: `${progress}%` }}
        />
      </div>
      {message && <div className={styles["progress-message"]}>{message}</div>}
    </div>
  );
};

export default ProgressBar;
