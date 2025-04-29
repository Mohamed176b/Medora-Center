import React, { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {supabase}from '../../supabase/supabaseClient';
const Header = React.lazy(() => import("../common/Header"));
const Footer = React.lazy(() => import("../common/Footer"));

const Site = () => {
  useEffect(() => {
    const trackSiteVisit = async () => {
      try {
        if (sessionStorage.getItem("site_visited")) return;
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        const userAgent = navigator.userAgent;
        const { data, error } = await supabase.from('site_views').insert([
          { ip_address: ip, user_agent: userAgent }
        ]);
        sessionStorage.setItem("site_visited", "1"); 
        if (error) throw error;
      } catch (e) {
      }
    };
    trackSiteVisit();
  }, []);
   

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

export default React.memo(Site);
