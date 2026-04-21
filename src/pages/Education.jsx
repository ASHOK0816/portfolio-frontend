import { useEffect, useState } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "../style/Education.css";

const EMPTY_FORM = {
  degree: "",
  college: "",
  startYear: "",
  endYear: "",
  pursuing: false,
  gradeType: "CGPA",
  grade: "",
};

export default function Education() {
  const [educationList, setEducationList] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchEducation = async () => {
    try {
      const res = await api.get("/education");
      setEducationList(res.data);
    } catch {
      toast.error("Failed to load education");
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  const getGradeText = (edu) => {
    if (edu.cgpa) return `CGPA: ${edu.cgpa}`;
    if (edu.percentage) return `${edu.percentage}%`;
    if (edu.grade) return edu.grade;
    return "N/A";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM); // ✅ always reset on close
  };

  const handleSubmit = async () => {
    if (!form.degree || !form.college || !form.startYear) {
      toast.warning("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        grade:
          form.gradeType === "Percentage" && form.grade
            ? form.grade + " %"
            : form.grade,
        endYear: form.pursuing ? "Pursuing" : form.endYear,
      };

      if (editing) {
        await api.put(`/education/${editing.id}`, payload);
        toast.success("Updated successfully ✨");
      } else {
        await api.post("/education", payload);
        toast.success("Added successfully 🚀");
      }

      closeModal();
      fetchEducation();
    } catch {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    const gradeType =
      item.grade && item.grade.includes("%") ? "Percentage" : "CGPA";

    setEditing(item);
    setForm({
      degree: item.degree || "",
      college: item.college || "",
      startYear: item.startYear || "",
      endYear: item.endYear === "Pursuing" ? "" : item.endYear || "",
      pursuing: item.endYear === "Pursuing",
      gradeType,
      grade:
        gradeType === "Percentage" && item.grade
          ? item.grade.replace("%", "").trim()
          : item.grade || "",
    });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/education/${deleteId}`);
      toast.success("Deleted successfully");
      fetchEducation();
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
        <div className="education-container">

          {/* HEADER */}
          <div className="education-header">
            <div className="projects-title-wrapper">
              <h2 className="education-title">Education</h2>
            </div>
            
            <button
              className="btn-add-education"
              onClick={() => setShowModal(true)}
            >
              <FaPlus size={12} />
              Add Education
            </button>
          </div>

          {/* GRID */}
          <div className="education-grid">
            {educationList.length === 0 ? (
              <p className="no-education">No education records found</p>
            ) : (
              educationList.map((edu) => (
                <div key={edu.id} className="education-card">

                  {/* ✅ Icon-only action buttons — top-right corner */}
                  <div className="education-actions">
                    <FaEdit
                      className="action-icon edit-icon"
                      size={14}
                      onClick={() => handleEdit(edu)}
                      aria-label="Edit education"
                      title="Edit"
                    />

                    <FaTimes
                      className="action-icon delete-icon"
                      onClick={() => {
                        setDeleteId(edu.id);
                        setShowDeleteModal(true);
                      }}
                      aria-label="Delete education"
                      title="Delete"
                    />
                  </div>

                  <h3 className="education-degree">{edu.degree}</h3>
                  <p className="education-college">{edu.college}</p>
                  <div className="education-meta">
                    <span className="education-year">
                      <strong>Year:</strong> {edu.startYear} – {" "}
                      {edu.endYear === "Pursuing" ? "Present" : edu.endYear}

                      {" • "}

                      <span className={`status ${edu.endYear === "Pursuing" ? "pursuing" : "completed"}`}>
                        {edu.endYear === "Pursuing" ? "Pursuing" : "Completed"}
                      </span>
                    </span>

                    {/* GRADE */}
                    <span className="education-grade">
                      <strong>
                        {edu.grade?.includes("%")
                          ? "Percentage:"
                          : edu.grade
                            ? "CGPA:"
                            : ""}
                      </strong>{" "}
                      {edu.grade || "N/A"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal modal-education"
              onClick={(e) => e.stopPropagation()} // prevent backdrop click closing
            >
              {/* HEADER — fixed centering */}
              <div className="modal-header">
                <h3 className="modal-title">
                  {editing ? "Edit Education" : "Add Education"}
                </h3>
                <button className="btn-close" onClick={closeModal} aria-label="Close">
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="modal-body">
                <input
                  name="degree"
                  placeholder="Degree *"
                  value={form.degree}
                  onChange={handleChange}
                  className="edu-input"
                />
                <input
                  name="college"
                  placeholder="College / University *"
                  value={form.college}
                  onChange={handleChange}
                  className="edu-input"
                />

                <div className="year-container">
                  <input
                    name="startYear"
                    placeholder="Start Year *"
                    value={form.startYear}
                    onChange={handleChange}
                    className="edu-input year-input"
                  />
                  {!form.pursuing && (
                    <input
                      name="endYear"
                      placeholder="End Year"
                      value={form.endYear}
                      onChange={handleChange}
                      className="edu-input year-input"
                    />
                  )}
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pursuing"
                      checked={form.pursuing}
                      onChange={handleChange}
                    />
                    Pursuing
                  </label>
                </div>

                <div className="grade-container">
                  <select
                    name="gradeType"
                    value={form.gradeType}
                    onChange={handleChange}
                    className="edu-input select-field"
                  >
                    <option value="CGPA">CGPA</option>
                    <option value="Percentage">Percentage</option>
                  </select>
                  <input
                    name="grade"
                    placeholder={form.gradeType === "CGPA" ? "e.g. 8.5" : "e.g. 85"}
                    value={form.grade}
                    onChange={handleChange}
                    className="edu-input grade-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : editing ? "Update" : "Add"}
                </button>
                <button className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Education?"
          message="This will permanently delete this record."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
}