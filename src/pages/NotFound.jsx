import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../style/NotFound.css";

export default function NotFound() {

  return (
    <div className="pageWrapper">

      {/* Background Zoom Layer */}
      <motion.div
        className="backgroundLayer"
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 3, ease: "easeOut" }}
      />

      {/* Neon Energy Pulse */}
      <motion.div
        className="energyPulse"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.4, opacity: 1 }}
        transition={{ duration: 2.5, ease: "easeOut" }}
      />

      {/* Cinematic Content */}
      <div className="contentContainer">

        <motion.h1
          className="glitchTitle"
          data-text="404"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        >
          404
        </motion.h1>

        <motion.h2
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          ACCESS DENIED
        </motion.h2>

        <motion.p
          className="description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          This node does not exist within the system grid.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 1 }}
        >
          <Link to="/" className="returnButton">
            RETURN TO DASHBOARD 👾
          </Link>
        </motion.div>

      </div>
    </div>
  );
}