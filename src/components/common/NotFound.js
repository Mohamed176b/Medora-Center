import React, { memo } from "react";
import { Link } from "react-router-dom";
import "../../style/NotFound.css";

const NotFound = memo(() => {
  React.useEffect(() => {
    document.title = "الصفحة غير موجودة | مركز ميدورا";
  }, []);
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <p>
          قد تكون الصفحة التي تبحث عنها قد تم حذفها أو غير متاحة في هذا الوقت.
        </p>
        <Link to="/" className="home-button">
          <i className="fa-solid fa-home"></i>
          العودة لصفحة الموقع
        </Link>
      </div>
    </div>
  );
});

NotFound.displayName = "NotFound";

export default NotFound;
