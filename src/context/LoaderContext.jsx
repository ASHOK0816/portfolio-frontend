import { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import GlobalLoader from "../components/GlobalLoader";

const LoaderContext = createContext();

// Defined outside — stable, never recreated
const MIN_DISPLAY_TIME = 400;
const DEBOUNCE_DELAY = 200;

let loaderHandler = {
  show: () => {},
  hide: () => {},
};

export const setLoaderHandler = (handler) => {
  loaderHandler = handler;
};

export const getLoaderHandler = () => loaderHandler;

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Loading...");

  // ✅ REQUIRED REFS (you missed these)
  const requestCount = useRef(0);
  const debounceTimer = useRef(null);
  const hideTimer = useRef(null);
  const startTime = useRef(null);

  // ================= SHOW =================

  // useCallback gives stable references — safe for useEffect deps & external handler
  const showLoader = useCallback((message = "Loading...") => {
    requestCount.current += 1;
    setText(message);

    if (requestCount.current === 1) {
      // Clear any pending hide timer from a previous cycle
      clearTimeout(hideTimer.current);

      debounceTimer.current = setTimeout(() => {
        startTime.current = Date.now(); // mark when loader became visible
        setLoading(true);
      }, DEBOUNCE_DELAY);
    }
  }, []);

  // ================= HIDE =================

   const hideLoader = useCallback(() => {
    requestCount.current = Math.max(0, requestCount.current - 1);

    if (requestCount.current === 0) {
      // Cancel debounce — loader may have never shown
      clearTimeout(debounceTimer.current);

      const doHide = () => {
        startTime.current = null;
        setLoading(false);
      };

      // Only enforce minDisplayTime if loader actually became visible
      if (startTime.current !== null) {
        const elapsed = Date.now() - startTime.current;
        const remaining = MIN_DISPLAY_TIME - elapsed;

        if (remaining > 0) {
          hideTimer.current = setTimeout(doHide, remaining);
        } else {
          doHide();
        }
      }
      // If debounce hadn't fired yet, loader was never shown — nothing to hide
    }
  }, []);

  // ✅ SET HANDLER ONLY ONCE
  useEffect(() => {
    setLoaderHandler({
      show: showLoader,
      hide: hideLoader,
    });
  }, [showLoader, hideLoader]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearTimeout(debounceTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <GlobalLoader isVisible={loading} text={text} />
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);