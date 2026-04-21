import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useLoader } from "../context/LoaderContext";

const useRouteLoader = () => {
  const location = useLocation();
  const loader = useLoader();
  const timer = useRef(null);

   useEffect(() => {
    if (!loader) return;

      timer.current = setTimeout(() => {
      loader.showLoader("Loading Page");
    }, 300); // smooth transition

    // hide after route stabilizes
    const hideTimer = setTimeout(() => {
      loader.hideLoader();
    }, 700);

    return () => {
      clearTimeout(timer.current);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);
};

export default useRouteLoader;