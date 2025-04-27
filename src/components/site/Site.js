import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";

const Header = React.lazy(() => import("../common/Header"));
const Footer = React.lazy(() => import("../common/Footer"));

const Site = () => {

  return (
    <>
      <Suspense fallback={<div>Loading Header...</div>}>
        <Header />
      </Suspense>

      <Outlet />
      <Suspense fallback={<div>Loading Footer...</div>}>
        <Footer />
      </Suspense>
    </>
  );
};

export default Site;
