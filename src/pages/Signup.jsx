import { useState } from "react";
import api from "../api/api";
import { sendOtp, verifyOtp } from "../api/otpApi";
import OtpInput from "../components/OtpInput";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "../style/Signup.css";

/* ─── SVG Icons ─── */
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

/* ─── Password strength ─── */
function PasswordStrength({ password }) {
  const score =
    password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)
      ? 3
      : password.length >= 6
        ? 2
        : password.length > 0
          ? 1
          : 0;
  const colors = ["", "#ef4444", "#f97316", "#22c55e"];
  return (
    <div className="su-pw-strength">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="su-pw-bar"
          style={{ background: i <= score ? colors[score] : undefined }}
        />
      ))}
    </div>
  );
}

/* ─── Field ─── */
function Field({ id, label, type = "text", value, onChange, error, icon, right, autoComplete }) {
  return (
    <div className="su-field">
      <div className="su-input-wrap">
        <span className="su-input-icon">{icon}</span>
        <input
          id={id}
          className={`su-input ${error ? "su-input--error" : ""}`}
          type={type}
          placeholder=" "
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <label className="su-label" htmlFor={id}>{label}</label>
        {right && <div className="su-input-right">{right}</div>}
      </div>
      {error && <p className="su-error">{error}</p>}
    </div>
  );
}

/* ─── Main Component ─── */
export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [errors, setErrors] = useState({});

  /* ── Shake ── */
  const triggerShake = () => {
    setShake(false);
    setTimeout(() => {
      setShake(true);
      setTimeout(() => setShake(false), 450);
    }, 10);
  };

  /* ── Validation ── */
  const validate = () => {
    const errs = {};
    if (!username.trim()) errs.username = "Username is required";
    if (username.length < 3) errs.username = "Minimum 3 characters required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = "Invalid email format";
    if (!password.trim()) errs.password = "Password is required";
    else if (password.length < 4) errs.password = "Minimum 4 characters required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearFieldError = (field) =>
    setErrors((prev) => ({ ...prev, [field]: "" }));

  /* ── Signup ── */
  const handleSignup = async () => {
    if (loading) return;
    if (!validate()) {
      triggerShake();
      return;
    }

    try {
      setLoading(true);

      // STEP 1: Send OTP
      await sendOtp(email);

      toast.success("OTP sent to your email");
      setStep(2);

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async () => {
    if (otp.length < 6) {
      toast.error("Enter 6 digit OTP");
      return;
    }

    try {
      setOtpLoading(true);

      // STEP 2: Verify OTP
      await verifyOtp(email, otp);

      // STEP 3: Create account
      const res = await api.post("/auth/signup", {
        username,
        email,
        password,
      },
      {
        headers: { "Content-Type": "application/json", "X-Signup-Secret": process.env.REACT_APP_SIGNUP_SECRET },
      }
    );

      toast.success(res.data?.message || "Account created");
      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
      triggerShake();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSocialSignup = (platform) => {
    toast.info(`${platform} signup coming soon`);
  };

  return (
    <div className="su-page">
      {/* Ambient orbs */}
      <div className="su-orb su-orb--1" aria-hidden="true" />
      <div className="su-orb su-orb--2" aria-hidden="true" />
      <div className="su-orb su-orb--3" aria-hidden="true" />

      <div className={`su-card ${shake ? "su-card--shake" : ""}`} role="main">

        {/* Brand */}
        <div className="su-brand">
          <div className="su-brand-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="su-brand-name">Admin Console</div>
            <div className="su-brand-sub">Portfolio management</div>
          </div>
        </div>

        {/* One-time badge */}
        <div className="su-badge" aria-label="One-time setup">
          <span className="su-badge-dot" aria-hidden="true" />
          One-time setup
        </div>

        <h1 className="su-title">
          {step === 1 ? "Create admin account" : "Verify OTP"}
        </h1>

        <p className="su-subtitle">
          {step === 1 ? "Set up your credentials to get started" : `Enter the OTP sent to ${email}`}
        </p>

        {step === 1 && (
          <>

            {/* Email */}
            <Field
              id="su-email"
              label="Email"
              value={email}
              error={errors.email}
              icon={<IconMail />}
              autoComplete="email"
              onChange={(e) => {
                const value = e.target.value;
                setEmail(value);

                // ✅ Only update username when @ exists
                const namePart = value.split("@")[0];

                // Prevent empty or unwanted override
                if (value.includes("@") && namePart) {
                  setUsername(namePart);
                } else if (!value.includes("@")) {
                  setUsername(value); // Keep updating until @ is typed
                }

                clearFieldError("email");
              }}
            />

            {/* Username */}
            <Field
              id="su-username"
              label="Username"
              value={username}
              error={errors.username}
              icon={<IconUser />}
              autoComplete="username"
              onChange={(e) => {
                setUsername(e.target.value);
                clearFieldError("username");
              }}
            />

            {/* Password */}
            <div className="su-field">
              <div className="su-input-wrap">
                <span className="su-input-icon"><IconLock /></span>
                <input
                  id="su-password"
                  className={`su-input ${errors.password ? "su-input--error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  autoComplete="new-password"
                />
                <label className="su-label" htmlFor="su-password">Password</label>
                <div className="su-input-right">
                  <button
                    className="su-pw-toggle"
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              <PasswordStrength password={password} />
              {errors.password && <p className="su-error">{errors.password}</p>}
            </div>

            {/* Signup button */}
            <button
              className="su-btn"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <div style={{ margin: "20px 0" }}>
              <OtpInput value={otp} onChange={setOtp} />
            </div>

            <button
              className="su-btn"
              onClick={handleVerifyAndSignup}
              disabled={otpLoading}
            >
              {otpLoading ? "Verifying OTP..." : "Verify OTP & Create Account →"}
            </button>

            {/* BACK OPTION */}
            <p className="su-foot">
              Wrong email?{" "}
              <span
                className="su-foot-link"
                onClick={() => setStep(1)}
                style={{ cursor: "pointer" }}
              >
                Go back
              </span>
            </p>
          </>
        )}

        {/* Terms */}
        {step === 1 && (
          <>
            <p className="su-terms">
              By signing up you agree to our{" "}
              <Link to="/terms">Terms of Service</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>
            </p>

            {/* Divider */}
            <div className="su-divider"><span>or continue with</span></div>

            {/* Social */}
            <div className="su-social">
              <button className="su-social-btn" type="button" onClick={() => handleSocialSignup("Google")}>
                <IconGoogle /> Google
              </button>
              <button className="su-social-btn" type="button" onClick={() => handleSocialSignup("GitHub")}>
                <IconGitHub /> GitHub
              </button>
            </div>

            {/* Footer */}
            <p className="su-foot">
              Already have an account?{" "}
              <Link to="/login" className="su-foot-link">Sign in</Link>
            </p>
          </>
        )}

      </div>
    </div>
  );
}