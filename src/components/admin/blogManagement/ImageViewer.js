import React, { useState, useCallback, useMemo, memo } from "react";
import styles from "../../../style/BlogManagement.module.css";

const ImageViewer = memo(({ image, onClose }) => {
  const [scale, setScale] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [startTouchDistance, setStartTouchDistance] = useState(null);
  const [startScale, setStartScale] = useState(1);

  const getTouchDistance = useCallback((touches) => {
    return Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY
    );
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        setIsPinching(true);
        const distance = getTouchDistance(e.touches);
        setStartTouchDistance(distance);
        setStartScale(scale);
      }
    },
    [getTouchDistance, scale]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (isPinching && e.touches.length === 2) {
        const distance = getTouchDistance(e.touches);
        const newScale = startScale * (distance / startTouchDistance);

        if (newScale >= 0.5 && newScale <= 3) {
          setScale(newScale);
        }
      }
    },
    [isPinching, getTouchDistance, startScale, startTouchDistance]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPinching(false);
    setStartTouchDistance(null);
    setStartScale(1);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(1);
  }, []);

  const imageStyle = useMemo(
    () => ({
      transform: `scale(${scale})`,
      transition: isPinching ? "none" : "transform 0.3s ease",
      touchAction: "none",
    }),
    [scale, isPinching]
  );

  if (!image) return null;

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
          style={imageStyle}
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
});

ImageViewer.displayName = "ImageViewer";

export default ImageViewer;
