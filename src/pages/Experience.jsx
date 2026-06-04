import { useEffect, useState } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import "../style/Experience.css";

const EMPTY_FORM = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  description: "",
};

export default function Experience() {
  const [experienceList, setExperienceList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchExperience = async () => {
    try {
      const res = await api.get("/experience");
      setExperienceList(res.data);
    } catch {
      toast.error("Failed to load experience");
    }
  };

  useEffect(() => {
    fetchExperience();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!form.company || !form.role || !form.startDate) {
      toast.warning("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/experience/${editing.id}`, form);
        toast.success("Updated successfully ✨");
      } else {
        await api.post("/experience", form);
        toast.success("Added successfully 🚀");
      }

      closeModal();
      fetchExperience();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      company: item.company || "",
      role: item.role || "",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      description: item.description || "",
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/experience/${deleteId}`);
      toast.success("Deleted successfully");
      fetchExperience();
    } catch {
      toast.error("Delete failed");
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Topbar />

        <div className="experience-container">

          {/* HEADER */}
          <div className="experience-header">
            <h2 className="experience-title">Experience</h2>

            <button
              className="btn-add-experience"
              onClick={() => setShowModal(true)}
            >
              <FaPlus size={12} />
              Add Experience
            </button>
          </div>

          {/* GRID */}
          <div className="experience-grid">
            {experienceList.length === 0 ? (
              <p className="no-experience">No experience added yet</p>
            ) : (
              experienceList.map((exp) => (
                <div key={exp.id} className="experience-card">

                  {/* ACTIONS */}
                  <div className="experience-actions">
                    <FaEdit
                      className="action-icon edit-icon"
                      size={14}
                      onClick={() => handleEdit(exp)}
                    />
                    <FaTimes
                      className="action-icon delete-icon"
                      onClick={() => {
                        setDeleteId(exp.id);
                        setShowDeleteModal(true);
                      }}
                    />
                  </div>

                  <h3 className="experience-company">{exp.company}</h3>
                  <p className="experience-role">{exp.role}</p>

                  <div className="experience-meta">
                    <span>
                      <strong>Duration:</strong>{" "}
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="experience-desc">{exp.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal modal-experience"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>
                  {editing ? "Edit Experience" : "Add Experience"}
                </h3>
                <button className="btn-close" onClick={closeModal}>
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="modal-body">
                <input
                  name="company"
                  placeholder="Company *"
                  value={form.company}
                  onChange={handleChange}
                  className="exp-input"
                />

                <input
                  name="role"
                  placeholder="Role *"
                  value={form.role}
                  onChange={handleChange}
                  className="exp-input"
                />

                <div className="date-container">
                  <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    className="exp-input"
                  />

                  <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    className="exp-input"
                  />
                </div>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={form.description}
                  onChange={handleChange}
                  className="exp-input textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editing
                    ? "Update"
                    : "Add"}
                </button>

                <button className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Experience?"
          message="This will permanently delete this record."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
}