import { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../style/Login.css";

/* ─── SVG Icons ─── */
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const IconGoogle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const IconGitHub = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

/* ─── Field ─── */
function Field({ id, label, type = "text", value, onChange, error, icon, right, autoComplete, onKeyDown }) {
  return (
    <div className="lf-field">
      <div className="lf-input-wrap">
        <span className="lf-input-icon">{icon}</span>
        <input
          id={id}
          className={`lf-input ${error ? "lf-input--error" : ""}`}
          type={type}
          placeholder=" "
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          autoComplete={autoComplete}
        />
        <label className="lf-label" htmlFor={id}>{label}</label>
        {right && <div className="lf-input-right">{right}</div>}
      </div>
      {error && <p className="lf-error">{error}</p>}
    </div>
  );
}

/* ─── Login Mode Toggle ─── */
function LoginModeToggle({ mode, onChange }) {
  return (
    <div className="lf-mode-toggle">
      <button
        type="button"
        className={`lf-mode-btn ${mode === "username" ? "lf-mode-btn--active" : ""}`}
        onClick={() => onChange("username")}
      >
        <IconUser /> Username
      </button>
      <button
        type="button"
        className={`lf-mode-btn ${mode === "email" ? "lf-mode-btn--active" : ""}`}
        onClick={() => onChange("email")}
      >
        <IconMail /> Email
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   Main Component
   ════════════════════════════════════════ */
export default function Login() {
  const navigate = useNavigate();

  const [loginMode, setLoginMode] = useState("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});

  const shakeRef = useRef(null);

  /* ── Redirect if already logged in ── */
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (token && window.location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => () => clearTimeout(shakeRef.current), []);

  /* ── Mode switch clears identifier ── */
  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setIdentifier("");
    setErrors({});
  };

  /* ── Shake ── */
  const triggerShake = useCallback(() => {
    setShake(false);
    clearTimeout(shakeRef.current);
    shakeRef.current = setTimeout(() => {
      setShake(true);
      shakeRef.current = setTimeout(() => setShake(false), 450);
    }, 10);
  }, []);

  /* ── Validation ── */
  const validate = () => {
    const errs = {};

    if (!identifier.trim()) {
      errs.identifier =
        loginMode === "email" ? "Email is required" : "Username is required";
    } else if (loginMode === "email" && !/^\S+@\S+\.\S+$/.test(identifier)) {
      errs.identifier = "Invalid email format";
    }

    if (!password.trim()) errs.password = "Password is required";
    else if (password.length < 4) errs.password = "Minimum 4 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  /* ── Login ── */
  const handleLogin = async () => {
    if (loading) return;
    if (!validate()) { triggerShake(); return; }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        login: identifier,
        password,
      });

      const { accessToken, refreshToken, role } = res.data;

      if (rememberMe) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("role", role);
      } else {
        sessionStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("refreshToken", refreshToken);
        sessionStorage.setItem("role", role);
      }

      toast.success("Login successful! Welcome back.");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
      setErrors({ password: msg });
      setPassword("");
      setShowPassword(false);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    toast.info(`${platform} login coming soon`);
  };

  /* ════ RENDER ════ */
  return (
    <div className="lf-page">
      {/* Ambient orbs */}
      <div className="lf-orb lf-orb--1" aria-hidden="true" />
      <div className="lf-orb lf-orb--2" aria-hidden="true" />
      <div className="lf-orb lf-orb--3" aria-hidden="true" />

      <div className={`lf-card ${shake ? "lf-card--shake" : ""}`} role="main">

        {/* Brand */}
        <div className="lf-brand">
          <div className="lf-brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="lf-brand-name">Admin Console</div>
            <div className="lf-brand-sub">Portfolio management</div>
          </div>
        </div>

        <h1 className="lf-title">Welcome back</h1>
        <p className="lf-subtitle">Sign in to your admin account</p>

        <LoginModeToggle mode={loginMode} onChange={handleModeChange} />

        {/* Identifier field */}
        <Field
          id="lf-identifier"
          label={loginMode === "email" ? "Email address" : "Username"}
          type={loginMode === "email" ? "email" : "text"}
          value={identifier}
          error={errors.identifier}
          icon={loginMode === "email" ? <IconMail /> : <IconUser />}
          autoComplete={loginMode === "email" ? "email" : "username"}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setIdentifier(e.target.value);
            clearFieldError("identifier");
          }}
        />

        {/* Password */}
        <Field
          id="lf-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          error={errors.password}
          icon={<IconLock />}
          autoComplete="current-password"
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setPassword(e.target.value);
            clearFieldError("password");
          }}
          right={
            <button
              className="lf-pw-toggle"
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          }
        />

        {/* Options row */}
        <div className="lf-options">
          <label className="lf-remember">
            <input
              type="checkbox"
              className="lf-checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((r) => !r)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="lf-forgot">
            Forgot password?
          </Link>
        </div>

        {/* Sign in button */}
        <button
          className="lf-btn"
          type="button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="lf-spinner" aria-label="Signing in" />
          ) : (
            <>Sign in <span className="lf-btn-arrow" aria-hidden="true">&#8594;</span></>
          )}
        </button>

        <div className="lf-divider"><span>or continue with</span></div>

        <div className="lf-social">
          <button className="lf-social-btn" type="button"
            onClick={() => handleSocialLogin("Google")}>
            <IconGoogle /> Google
          </button>
          <button className="lf-social-btn" type="button"
            onClick={() => handleSocialLogin("GitHub")}>
            <IconGitHub /> GitHub
          </button>
        </div>

        <p className="lf-foot">
          Don't have access?{" "}
          <Link to="/signup" className="lf-foot-link">Create account</Link>
        </p>

      </div>
    </div>
  );
}