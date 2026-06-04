const AdminModal = ({ title, children, onClose }) => {
  return (
    <div className="admin-modal">
      <div className="admin-modal__overlay" onClick={onClose}></div>

      <div className="admin-modal__content card elevation-3">
        <div className="admin-modal__header">
          <h2>{title}</h2>
          <button className="admin-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="admin-modal__body">{children}</div>
      </div>
    </div>
  );
};

export default AdminModal;