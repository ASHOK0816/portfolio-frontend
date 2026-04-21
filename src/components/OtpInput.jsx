import { useEffect, useRef } from "react";
import "../style/ForgotPassword.css";

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputs = useRef([]);

  useEffect(() => {
    // Focus the first input on mount
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "");

    if (!val) return;

    const otpArr = value.split("");
    otpArr[i] = val[0];
    const finalOtp = otpArr.join("").slice(0, length);
    onChange(finalOtp);

    // Move forward
    if (i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      if (value[i]) {
        // Just clear current box
        const otpArr = value.split("");
        otpArr[i] = "";
        onChange(otpArr.join(""));
      } else if (i > 0) {
        // Move back if already empty
        inputs.current[i - 1]?.focus();
      }
    }

    // Arrow navigation (bonus)
    if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowRight" && i < length - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  // ✅ Handle paste (🔥 important)
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");

    if (!paste) return;

    const newOtp = paste.slice(0, length);
    onChange(newOtp);

    // Focus last filled box
    const lastIndex = newOtp.length - 1;
    inputs.current[lastIndex]?.focus();
  };

  return (
    <div className="otp-container">
      {[...Array(6)].map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          className="otp-input"
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
