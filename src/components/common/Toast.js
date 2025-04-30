import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { hideToast } from "../../redux/slices/toastSlice";

const Toast = () => {
  const { message, type, show, duration } = useSelector((state) => state.toast);
  const dispatch = useDispatch();

  const [toast, setToast] = useState({
    message: "",
    type: "success",
    show: false,
    exiting: false,
  });

  useEffect(() => {
    if (show) {
      setToast({
        message: message,
        type: type,
        show: true,
        exiting: false,
      });

      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, exiting: true }));

        const exitTimer = setTimeout(() => {
          setToast((prev) => ({ ...prev, show: false }));
          dispatch(hideToast());
        }, 500); 

        return () => clearTimeout(exitTimer);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setToast((prev) => ({ ...prev, show: false, exiting: false }));
    }
  }, [message, type, show, duration, dispatch]);

  const toastClass = React.useMemo(() => `toast toast-${toast.type} ${toast.exiting ? "toast-exit" : ""}`, [toast.type, toast.exiting]);

  return (
    <>
      {toast.show && (
        <div className={toastClass}>
          <p>{toast.message}</p>
        </div>
      )}
    </>
  );
};

export default React.memo(Toast);
