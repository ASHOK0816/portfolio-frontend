import { NavLink, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaProjectDiagram, FaGraduationCap, FaTools, FaUser, FaEnvelope, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import "../style/Sidebar.css";
import { useState } from "react";

export default function Sidebar() {

  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    // remove correct keys
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("role");

    toast.success("Logged out successfully 👋");

    // force clean redirect (important)
    setTimeout(() => {
      window.location.href = "/login";
    }, 800);
  };

  return (
    <aside className={`sidebar-container ${collapsed ? "collapsed" : ""}`}>

      {/* TOP SECTION */}
      <div className="sidebar-top">

        <div className="sidebar-logo">
          {collapsed ? "AP" : "Admin Panel"}
        </div>

        {/* TOGGLE BUTTON */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FaBars /> : <FaTimes />}
        </button>
      </div>

      <nav className="sidebar-nav">

        <NavLink className="sidebar-link" to="/">
          <FaTachometerAlt className="sidebar-icon" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink className="sidebar-link" to="/projects">
          <FaProjectDiagram className="sidebar-icon" />
          {!collapsed && <span>Projects</span>}
        </NavLink>

        <NavLink className="sidebar-link" to="/education">
          <FaGraduationCap className="sidebar-icon" />
          {!collapsed && <span>Education</span>}
        </NavLink>

        <NavLink className="sidebar-link" to="/skills">
          <FaTools className="sidebar-icon" />
          {!collapsed && <span>Skills</span>}
        </NavLink>

        <NavLink className="sidebar-link" to="/messages">
          <FaEnvelope className="sidebar-icon" />
          {!collapsed && <span>Messages</span>}
        </NavLink>

        <NavLink className="sidebar-link" to="/profile">
          <FaUser className="sidebar-icon" />
          {!collapsed && <span>Profile</span>}
        </NavLink>

      </nav>

      <button className="sidebar-logout-btn" onClick={logout}>
        <FaSignOutAlt className="sidebar-icon" />
        {!collapsed && <span>Logout</span>}
      </button>

    </aside >
  );
}