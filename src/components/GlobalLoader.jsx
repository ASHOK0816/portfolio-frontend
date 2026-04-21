import { useEffect, useState } from "react";
import "../style/GlobalLoader.css";

const GlobalLoader = ({ text = "Loading...", isVisible }) => {
  const[shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeout;

    if (isVisible) {
      setShouldRender(true);
    } else {
      timeout = setTimeout(() => {
        setShouldRender(false);
      }, 300); // match CSS exit animation
    }
      return () => clearTimeout(timeout);
    }, [isVisible]);

  if(!shouldRender) return null;

  return (
    <div className={`global-loader ${isVisible ? "show" : "hide"}`}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="loader-container">
        <div className="spinner" aria-hidden="true"></div>
        <p className="loader-text">{text}</p>
      </div>
    </div>
  );
};

export default GlobalLoader;