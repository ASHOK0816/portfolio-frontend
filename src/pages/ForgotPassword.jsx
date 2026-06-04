import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp, resetPassword } from "../api/otpApi";
import { toast } from "react-toastify";
import "../style/ForgotPassword.css";
import api from "../api/api";

/* ─── OTP Input ─── */
function OtpInput({ value, onChange }) {
  // ✅ All 6 refs declared individually at the top level — no hooks inside loops/callbacks
  const ref0 = useRef(null);
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handle = (i, e) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[i] = v;
    onChange(next.join(""));
    if (v && i < 5) refs[i + 1].current?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  return (
    <div className="otp-row">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          className={`otp-box ${d ? "filled" : ""}`}
          value={d}
          maxLength={1}
          inputMode="numeric"
          onChange={(e) => handle(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
        />
      ))}
    </div>
  );
}

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
    <div className="pw-strength">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="pw-bar"
          style={{ background: i <= score ? colors[score] : undefined }}
        />
      ))}
    </div>
  );
}

/* ─── Step dots ─── */
function StepDots({ current }) {
  return (
    <div className="step-dots">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`dot ${i === current ? "active" : i < current ? "done" : ""}`}
        />
      ))}
    </div>
  );
}

const TITLES = {
  1: ["Forgot password", "Enter your admin Email to continue"],
  2: ["Verify OTP", "Enter the 6-digit code sent to your Email"],
  3: ["New password", "Choose a strong password to secure your account"],
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [timer, setTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const intervalRef = useRef(null);
  const shakeRef = useRef(null);

  /* ── Timer ── */
  useEffect(() => {
    if (timer <= 0) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => setTimer((p) => p - 1), 1000);
    return () => clearInterval(intervalRef.current);
  }, [timer]);

  useEffect(() => () => clearTimeout(shakeRef.current), []);

  const triggerShake = (msg) => {
    setError(msg);
    toast.error(msg);
    setShake(true);
    clearTimeout(shakeRef.current);
    shakeRef.current = setTimeout(() => setShake(false), 450);
  };

  const clearErr = () => setError("");

  /* ── Validation ── */
  const validateEmail = () => {
    if (!email.trim()) { triggerShake("Email is required"); return false; }
    return true;
  };

  const validatePassword = () => {
    if (!password.trim()) { triggerShake("Password is required"); return false; }
    if (password.length < 6) { triggerShake("Password must be at least 6 characters"); return false; }
    return true;
  };

  /* ── Navigation ── */
  const goBack = () => {
    if (step > 1) { setStep((s) => s - 1); clearErr(); }
  };

  /* ── API calls ── */
  const handleSendOtp = async () => {
    if (timer > 0 || loading || !email.trim()) {
      triggerShake("Email is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/admin/send-otp", { email });

      toast.success("OTP sent successfully");
      setStep(2);
      setTimer(60);
      clearErr();
    } catch (err) {
      triggerShake(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { triggerShake("Enter all 6 digits"); return; }
    try {
      setLoading(true);
      await verifyOtp(email, otp);
      toast.success("OTP verified");
      setStep(3);
      clearErr();
    } catch (err) {
      triggerShake(err?.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    try {
      setLoading(true);
      await resetPassword(email, password);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      triggerShake(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const [title, subtitle] = TITLES[step];

  return (
    <div className="fp-container">
      <div className={`fp-card ${shake ? "shake" : ""}`}>

        {/* Header */}
        <div className="fp-header">
          <button
            className={`back-btn ${step === 1 ? "invisible" : ""}`}
            onClick={goBack}
            aria-label="Go back"
          >
            &#8592;
          </button>
          <div className="fp-title-block">
            <h2 className="fp-title">{title}</h2>
            <p className="fp-subtitle">{subtitle}</p>
          </div>
          <StepDots current={step} />
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="step-content">
            <div className="field-wrap">
              <label className="field-label">Email</label>
              <input
                className="fp-input"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                autoComplete="email"
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="fp-btn" onClick={handleSendOtp} disabled={loading || timer > 0}>
              {loading ? "Sending..." : <> Send OTP <span className="btn-arrow">&#8594;</span> </>}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="step-content">
            <div className="info-box">
              Code sent to account linked with <strong>{email}</strong>
            </div>
            <div className="field-wrap">
              <label className="field-label">One-time password</label>
              <OtpInput value={otp} onChange={setOtp} />
            </div>
            {error && <p className="field-error" style={{ textAlign: "center" }}>{error}</p>}
            <button className="fp-btn" onClick={handleVerifyOtp} disabled={loading}>
              {loading ? "Verifying..." : <> Verify OTP <span className="btn-arrow">&#8594;</span> </>}
            </button>
            <div className="resend-row">
              {timer > 0 ? (
                <span className="resend-timer">Resend in {timer}s</span>
              ) : (
                <>
                  <span className="resend-label">Didn't receive it?</span>
                  <button className="resend-link" onClick={handleSendOtp} disabled={loading}>
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="step-content">
            <div className="field-wrap">
              <label className="field-label">New password</label>
              <div className="pw-wrap">
                <input
                  className="fp-input"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  autoComplete="new-password"
                />
                <button
                  className="pw-toggle"
                  onClick={() => setShowPw((p) => !p)}
                  type="button"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button className="fp-btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Updating..." : <> Reset password <span className="btn-arrow">&#8594;</span> </>}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}