import React from "react";

const Loader = () => {
  return (
    <div className="loader-container">
      <img src={`${process.env.PUBLIC_URL}/logo.svg`} alt="logo" loading="lazy"/>
    </div>
  );
};

export default React.memo(Loader);
