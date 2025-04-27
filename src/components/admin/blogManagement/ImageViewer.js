import React, { useState } from "react";
import styles from "../../../style/BlogManagement.module.css";

const ImageViewer = ({ image, onClose }) => {
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [startTouchDistance, setStartTouchDistance] = useState(null);
  const [startScale, setStartScale] = useState(1);

  if (!image) return null;

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      const distance = getTouchDistance(e.touches);
      setStartTouchDistance(distance);
      setStartScale(scale);
    }
  };

  const handleTouchMove = (e) => {
    if (isPinching && e.touches.length === 2) {
      const distance = getTouchDistance(e.touches);
      const newScale = startScale * (distance / startTouchDistance);

      // حد أدنى وأقصى للتكبير
      if (newScale >= 0.5 && newScale <= 3) {
        setScale(newScale);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsPinching(false);
    setStartTouchDistance(null);
    setStartScale(1);
  };

  const getTouchDistance = (touches) => {
    return Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    );
  };

  const handleDoubleClick = () => {
    // إعادة تعيين حجم الصورة عند النقر المزدوج
    setScale(1);
  };

  return (
    <div
      className={styles["image-viewer-overlay"]}
      onClick={onClose}
      role="dialog"
      aria-label="معاينة الصورة"
    >
      <div
        className={styles["image-viewer-content"]}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={image.url}
          alt={image.name}
          style={{
            transform: `scale(${scale})`,
            transition: isPinching ? "none" : "transform 0.3s ease",
            touchAction: "none",
          }}
          draggable={false}
          loading="lazy"
        />
        <button
          className={styles["image-viewer-close"]}
          onClick={onClose}
          aria-label="إغلاق المعاين"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;
