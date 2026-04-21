import { useEffect, useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { toast, ToastContainer } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaLinkedin, FaGithub } from "react-icons/fa";

import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../style/Profile.css";
import "react-toastify/dist/ReactToastify.css";

const XP_RULES = [
  { key: "name",     xp: 15 },
  { key: "email",    xp: 20 },
  { key: "phone",    xp: 15 },
  { key: "linkedin", xp: 20 },
  { key: "github",   xp: 20 },
  { key: "photoUrl", xp: 10 },
];

// ─── Moved OUTSIDE the component to prevent remount on every render ───────────
const InputField = ({ icon, name, value, onChange, editing, placeholder }) => (
  <div className="profile-field">
    {icon}
    <input
      name={name}
      value={value ?? ""}
      onChange={onChange}
      disabled={!editing}
      placeholder={placeholder}
    />
  </div>
);

const computeXP = (profile) =>
  profile
    ? XP_RULES.reduce((total, rule) => total + (profile[rule.key] ? rule.xp : 0), 0)
    : 0;

const getLevel = (xp) => (xp >= 100 ? 3 : xp >= 50 ? 2 : 1);

const getLevelName = (level) =>
  level === 3 ? "Elite" : level === 2 ? "Pro" : "Beginner";

const CIRCLE = 2 * Math.PI * 62;

// ─── Component ────────────────────────────────────────────────────────────────
const Profile = () => {
  const [profile,      setProfile]      = useState(null);
  const [editData,     setEditData]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [file,         setFile]         = useState(null);
  const [showCelebrate,setShowCelebrate]= useState(false);
  const [levelUpAnim,  setLevelUpAnim]  = useState(false);

  // Use a ref to track whether we already fired confetti for 100 XP.
  // Key fix: we never reset this — once celebrated, it stays celebrated for
  // the lifetime of this component mount.
  const hasCelebrated = useRef(false);
  // Initialised to the real level so the first render never false-triggers.
  const prevLevelRef  = useRef(null);

  // ── Derived values ──────────────────────────────────────────────────────────
  const xp    = computeXP(profile);
  const level = getLevel(xp);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/profile/admin");
      setProfile(data);
      setEditData(data);
      // Seed prevLevelRef with the real level on first load so level-up
      // animation does not trigger on mount.
      prevLevelRef.current = getLevel(computeXP(data));
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ── Celebration effect (run confetti once when xp first reaches 100) ────────
  useEffect(() => {
    if (!profile || hasCelebrated.current) return;

    if (xp >= 100) {
      hasCelebrated.current = true;          // ← never reset — fires ONCE only
      setShowCelebrate(true);

      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

      const end = Date.now() + 1500;
      const fire = () => {
        confetti({
          particleCount: 5,
          spread: 160,
          startVelocity: 45,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
        });
        if (Date.now() < end) requestAnimationFrame(fire);
      };
      fire();
    }
  }, [xp, profile]);

  // ── Celebration overlay auto-hide ───────────────────────────────────────────
  useEffect(() => {
    if (!showCelebrate) return;
    const timer = setTimeout(() => setShowCelebrate(false), 3200);
    return () => clearTimeout(timer);
  }, [showCelebrate]);

  // ── Level-up animation (state-driven, not direct DOM) ───────────────────────
  useEffect(() => {
    // Skip on first evaluation (prevLevelRef not yet set)
    if (prevLevelRef.current === null) return;

    if (level > prevLevelRef.current) {
      setLevelUpAnim(true);
      const timer = setTimeout(() => setLevelUpAnim(false), 1000);
      prevLevelRef.current = level;
      return () => clearTimeout(timer);
    }

    prevLevelRef.current = level;
  }, [level]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = useCallback(
    (e) => setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    []
  );

  const handleSave = async () => {
    try {
      const { data } = await api.put("/profile/admin", editData);
      setProfile(data);
      setEditData(data);
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.warning("Select a file first");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await api.post("/profile/admin/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile({ ...data, photoUrl: `${data.photoUrl}?t=${Date.now()}` });
      setFile(null);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const { data } = await api.delete("/profile/admin/photo");
      setProfile(data);
      setFile(null);
      toast.info("Photo removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleCancelEdit = useCallback(() => {
    setEditData(profile);   // ← restore uncommitted changes on cancel
    setEditing(false);
  }, [profile]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="profile-layout">
      <Sidebar />
      <div className="profile-main">
        <Topbar />
        <div className="profile-container">
          <ToastContainer />

          {loading ? (
            <div className="profile-card glass">Loading...</div>
          ) : (
            <div className="profile-card glass">
              <h2 className="profile-title">My Profile</h2>

              {/* XP PANEL */}
              <div className="xp-panel">
                <div className={`xp-level${levelUpAnim ? " level-up" : ""}`}>
                  Level {level} — {getLevelName(level)}
                </div>
                <div className="xp-bar">
                  <div className="xp-fill" style={{ width: `${Math.min(xp, 100)}%` }} />
                </div>
                <div className="xp-text">{xp} / 100 XP</div>
              </div>

              {/* PROGRESS RING */}
              <div className={`profile-progress${xp >= 100 ? " completed" : ""}`}>
                <svg className="progress-ring" width="150" height="150">
                  <defs>
                    <linearGradient id="brandGradient">
                      <stop offset="0%"   stopColor="var(--clr-primary-500)" />
                      <stop offset="100%" stopColor="var(--clr-accent-500)"  />
                    </linearGradient>
                  </defs>
                  <circle className="ring-bg"       cx="75" cy="75" r="62" />
                  <circle
                    className="ring-progress"
                    cx="75" cy="75" r="62"
                    stroke="url(#brandGradient)"
                    style={{
                      strokeDasharray:  CIRCLE,
                      strokeDashoffset: CIRCLE - (CIRCLE * Math.min(xp, 100)) / 100,
                    }}
                  />
                </svg>

                <div className="profile-photo-center">
                  {profile?.photoUrl ? (
                    <img
                      src={`http://localhost:8080${profile.photoUrl}`}
                      alt="profile"
                    />
                  ) : (
                    <div className="profile-placeholder">No Photo</div>
                  )}
                </div>

                <div className="progress-percent">{Math.min(xp, 100)}%</div>
              </div>

              {/* PHOTO ACTIONS */}
              {editing && (
                <div className="profile-photo-actions">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <div className="profile-btn-group">
                    <button className="btn btn-primary" onClick={handleUpload}>
                      Upload
                    </button>
                    <button className="btn btn-danger" onClick={handleDeletePhoto}>
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* BADGES */}
              {!editing && (
                <div className="profile-badges">
                  {xp >= 30  && <span className="badge bronze">Starter</span>}
                  {xp >= 60  && <span className="badge silver">Growing</span>}
                  {xp >= 80  && <span className="badge gold">Pro</span>}
                  {xp >= 100 && <span className="badge platinum">Elite</span>}
                </div>
              )}

              {/* INPUTS */}
              {[
                { icon: <FaUser />,    name: "name",     placeholder: "Name"     },
                { icon: <FaEnvelope />,name: "email",    placeholder: "Email"    },
                { icon: <FaPhone />,   name: "phone",    placeholder: "Phone"    },
                { icon: <FaLinkedin />,name: "linkedin", placeholder: "LinkedIn" },
                { icon: <FaGithub />,  name: "github",   placeholder: "GitHub"   },
              ].map(({ icon, name, placeholder }) => (
                <InputField
                  key={name}
                  icon={icon}
                  name={name}
                  placeholder={placeholder}
                  value={editData?.[name]}
                  onChange={handleChange}
                  editing={editing}
                />
              ))}

              {/* BUTTONS */}
              {!editing ? (
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <div className="profile-btn-group">
                  <button className="btn btn-success" onClick={handleSave}>
                    Save
                  </button>
                  <button className="btn btn-danger" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </div>
              )}

              {/* CELEBRATION OVERLAY */}
              {showCelebrate && (
                <div className="celebration-overlay">
                  <p className="celebration-message">
                    Congratulations! Profile Complete 🥳
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;