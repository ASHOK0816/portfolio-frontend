import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import CountUp from "react-countup";
import GlobalLoader from "../components/GlobalLoader";
import { FaProjectDiagram, FaTools, FaEnvelope, FaGraduationCap } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "react-toastify/dist/ReactToastify.css";
import "../style/Dashboard.css";

const CARD_COLORS = [
  "linear-gradient(135deg, #4f46e5, #6366f1)",
  "linear-gradient(135deg, #22c55e, #4ade80)",
  "linear-gradient(135deg, #f59e0b, #fbbf24)",
  "linear-gradient(135deg, #ec4899, #f472b6)",
];

const ICON_MAP = {
  Projects:  <FaProjectDiagram aria-hidden="true" />,
  Skills:    <FaTools          aria-hidden="true" />,
  Messages:  <FaEnvelope       aria-hidden="true" />,
  Education: <FaGraduationCap  aria-hidden="true" />,
};

const EMOJI_MAP = {
  Messages:  "📩",
  Projects:  "📁",
  Education: "🎓",
  Skills:    "🛠",
};

function StatCard({ stat, color, onClick, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className="dashboard-stat-card glass-card"
      style={{ background: color }}
      onClick={() => onClick(stat.label)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(stat.label)}
      aria-label={`Go to ${stat.label}`}
    >
      <div className="stat-icon">{ICON_MAP[stat.label]}</div>
      <h3 className="stat-title">{stat.label}</h3>
      <p className="stat-value">
        {isNaN(stat.value) ? (
          stat.value
        ) : (
          <CountUp end={Number(stat.value)} duration={1.5} />
        )}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [stats, setStats]               = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [colorOffset, setColorOffset]   = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/auth/dashboard", { signal: controller.signal });
        setStats(res.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          setError("Failed to load dashboard stats. Please try again.");
          toast.error("Failed to load dashboard stats.");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (hoveredIndex !== null) return;
    const interval = setInterval(() => {
      setColorOffset((prev) => (prev + 1) % CARD_COLORS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [hoveredIndex]);

  const handleCardClick = useCallback(
    (name) => {
      const routes = {
        Projects:  "/projects",
        Skills:    "/skills",
        Messages:  "/messages",
        Education: "/education",
      };
      if (routes[name]) navigate(routes[name]);
    },
    [navigate]
  );

  const chartData = useMemo(
    () =>
      stats
        .filter((item) => !isNaN(item.value))
        .map((item) => ({ name: item.label, value: Number(item.value) })),
    [stats]
  );

  // ✅ FIXED: clean single line using GlobalLoader
  if (loading) return <GlobalLoader text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="dashboard-root page-root page-dashboard">
        <Sidebar />
        <div className="dashboard-wrapper">
          <Topbar />
          <div className="dashboard-content-area">
            <p style={{ color: "red" }}>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    // ✅ ADDED: page-root page-dashboard for global theme blobs + tokens
    <div className="dashboard-root page-root page-dashboard">
      <ToastContainer position="top-right" autoClose={2500} />
      <Sidebar />

      <div className="dashboard-wrapper">
        <Topbar />

        <div className="dashboard-content-area">
          <h2 className="dashboard-heading">DASHBOARD</h2>

          <div className="dashboard-stats-grid">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                stat={stat}
                color={CARD_COLORS[(index + colorOffset) % CARD_COLORS.length]}
                onClick={handleCardClick}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </div>

          <div className="chart-card glass-card">
            <h3 className="chart-title">Overview 📊</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip className="chart-tooltip color-black" />
                <Bar dataKey="value" fill="url(#colorBar)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="activity-card glass-card">
            <h3 className="activity-title">Recent Activity</h3>
            <ul className="activity-list">
              {stats.map((stat, index) => (
                <li key={index}>
                  {EMOJI_MAP[stat.label]} {stat.label} updated ({stat.value})
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}