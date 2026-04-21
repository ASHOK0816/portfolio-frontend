import { useEffect } from "react";
import "../style/ConfirmModal.css";

const ICONS = {
  danger: (
    <svg viewBox="0 0 24 24" className="confirm-svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM6 9h2v8H6V9z"
      />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" className="confirm-svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2L2 22h20L12 2zm1 15h-2v-2h2v2zm0-4h-2V9h2v4z"
      />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className="confirm-svg" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10
        10-4.48 10-10S17.52 2 12 2z"
      />
    </svg>
  ),
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
  loading = false,
}) {

  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, loading, onClose]);

  // ✅ Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ✅ Only close overlay click when not loading
  const handleOverlayClick = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="confirm-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
    >
      <div className="confirm-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`confirm-icon ${type}`}>
          {ICONS[type]}
        </div>

        <h3 id="confirm-title" className="confirm-title">
          {title}
        </h3>

        <p id="confirm-description" className="confirm-message">
          {message}
        </p>

        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            className={`btn btn-confirm ${type}`}
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}