import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { toast } from "react-toastify";
import "../style/Topbar.css";
import { connectSocket, disconnectSocket } from "../api/socket";

export default function Topbar() {
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const stompRef = useRef(null);

  /* ================= THEME ================= */
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("portfolio-theme");
    return saved ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  /* ================= DATA ================= */

  const fetchUnread = useCallback(async () => {
    try {
      const res = await api.get("/messages");
      const unread = res.data.filter((m) => !m.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("fetchUnread failed",err);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile/admin");
      setProfile(res.data);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ================= SOCKET ================= */

  const didRun = useRef(false);

useEffect(() => {
  if (didRun.current) return;
  didRun.current = true;

  loadProfile();
  fetchUnread();
}, []);

const socketInit = useRef(false);

  useEffect(() => {
  connectSocket((newMessage) => {
    setUnreadCount(prev => prev + 1);
    toast.info("📩 New message received!");
    setShake(true);
    setTimeout(() => setShake(false), 600);
  });

  return () => {
    disconnectSocket(); // ✅ correct cleanup
  };
}, []);

  const goToMessages = () => navigate("/messages");

  /* ================= ICONS ================= */

  const BellIcon = () => (
    <svg viewBox="0 0 24 24" className="bell-svg">
      <path
        d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2Z"
        fill="currentColor"
      />
      <path
        d="M18 16V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
    </svg>
  );

  const SunIcon = () => (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );

  const MoonIcon = () => (
    <svg viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );

  /* ================= UI ================= */

  return (
    <header className="topbar-container">

      {/* LEFT */}
      <div className="topbar-left">
        <h3 className="topbar-title">
          Welcome back,{" "}
          <span className="admin-name">{profile?.name || "Admin"}</span>
        </h3>
      </div>

      {/* RIGHT */}
      <div className="topbar-right">

        {/* THEME */}
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* NOTIFICATION BELL */}
        <div className="bell-wrapper" onClick={goToMessages}>
          <button className={`icon-btn notification ${shake ? "shake" : ""}`}>
            <BellIcon />

            {unreadCount > 0 && (
              <span className="bell-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* PROFILE */}
        <div className="admin-profile">
          {loading ? (
            <div className="avatar-skeleton" />
          ) : (
            <img
              src={
                profile?.photoUrl
                  ? `http://localhost:8080${profile.photoUrl}`
                  : "https://i.pravatar.cc/40"

              }
              className="admin-avatar"
              alt="admin"
            />
          )}
        </div>

      </div>
    </header>
  );
}