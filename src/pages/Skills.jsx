import { useEffect, useState } from "react";
import api from "../api/api";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import { FaTimes, FaEdit, FaPlus, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import "../style/Skills.css";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteSkillId, setDeleteSkillId] = useState(null); // Track which skill to delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [form, setForm] = useState({ name: "", image: null, category: "Frontend", });
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch skills from backend
  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills");
      setSkills(res.data);
    } catch {
      toast.error("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Filter skills by category
  const filteredSkills =
    activeCategory === "All"
      ? skills
      : skills.filter((s) => s.category === activeCategory);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Add skill
  const handleAddSkill = async () => {
    if (!form.name || !form.image) {
      toast.warning("Name and image are required");
      return;
    }
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("image", form.image);
      data.append("category", form.category);

      await api.post("/skills", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Skill added successfully!");
      setForm({ name: "", image: null, category: "Frontend" });
      setShowModal(false);
      fetchSkills();
    } catch {
      toast.error("Failed to add skill");
    }
  };

  // Update skill image
  const handleUpdateImage = async (id, file) => {
    try {
      const data = new FormData();
      data.append("image", file);

      await api.put(`/skills/${id}/image`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Image updated!");
      fetchSkills();
    } catch {
      toast.error("Failed to update image");
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteSkillId(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/skills/${deleteSkillId}`);
      toast.success("Skill deleted!");
      fetchSkills();
    } catch {
      toast.error("Failed to delete skill");
    } finally {
      setIsConfirmOpen(false);
      setDeleteSkillId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeleteSkillId(null);
  };


  // Reorder skill up/down
  const handleReorder = async (index, direction) => {
    const newSkills = [...skills];

    if (direction === "up" && index > 0) {
      [newSkills[index - 1], newSkills[index]] = [newSkills[index], newSkills[index - 1]];
    } else if (direction === "down" && index < newSkills.length - 1) {
      [newSkills[index + 1], newSkills[index]] = [newSkills[index], newSkills[index + 1]];
    } else {
      return;
    }
    setSkills(newSkills);

    try {
      await api.put("/skills/reorder", newSkills.map((s) => s.id));
      toast.success("Skills reordered!");
    } catch {
      toast.error("Failed to reorder skills");
    }
  };

  return (

    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Topbar />

        <div className="skills-page container">

          {/* HEADER */}
          <div className="skills-header">

            <div className="skills-header-left"></div>

              <h2 className="skills-title">Skills</h2>
            
            <div className="skills-header-actions">
            <button
              className="add-btn btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <FaPlus size={12} />
              Add Skill
            </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="skills-filters">
            {["All", "Frontend", "Backend", "Database", "Tools"].map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* GRID */}
          <div className="skills-grid grid">

            {/* ✅ SKELETON */}
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="skills-card skeleton-card">
                  <div className="skeleton skeleton-circle"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))
            ) : skills.length === 0 ? (
              <p className="skills-empty text-center">No skills found 🚀</p>
            ) : (
              filteredSkills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="skills-card card"
                >

                  <span className="skill-category-badge">
                    {skill.category}
                  </span>

                  {/* IMAGE */}
                  <img
                    className="skills-card-image"
                    src={
                      skill.image
                        ? `http://localhost:8080${skill.image}`
                        : "/no-image.png"
                    }
                    alt={skill.name}
                  />

                  {/* TITLE */}
                  <h4 className="skills-card-title">
                    {skill.name}
                  </h4>

                  {/* ACTIONS (HOVER ICONS) */}
                  <div className="skills-actions">

                    {/* EDIT IMAGE */}
                    <label className="action-icon edit-icon" data-tooltip="Edit">
                      <FaEdit size={14} />
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          handleUpdateImage(skill.id, e.target.files[0])
                        }
                      />
                    </label>

                    {/* DELETE */}
                    <FaTimes
                      className="action-icon delete-icon" data-tooltip="Delete"
                      size={14}
                      onClick={() => handleDeleteClick(skill.id)}
                    />
                  </div>

                  {/* REORDER */}
                  <div className="skills-reorder">
                    <FaArrowLeft
                      className="reorder-icon" data-tooltip="Move Up"
                      onClick={() => handleReorder(index, "up")}
                    />
                    <FaArrowRight
                      className="reorder-icon" data-tooltip="Move Down"
                      onClick={() => handleReorder(index, "down")}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MODAL */}
          {showModal && (
            <div className="skills-modal-overlay">
              <div className="skills-modal card elevation-3">

                <h3 className="skills-modal-title">Add Skill</h3>

                <select
                  className="input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Database</option>
                  <option>Tools</option>
                </select>

                <input
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Skill Name"
                  value={form.name}
                  onChange={handleChange}
                />

                <input
                  type="file"
                  name="image"
                  className="input"
                  onChange={handleChange}
                />

                <div className="skills-modal-actions flex justify-center">
                  <button
                    className="btn btn-primary"
                    onClick={handleAddSkill}
                  >
                    Add
                  </button>

                  <button
                    className="btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* DELETE CONFIRM */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Skill"
        message="Are you sure you want to delete this skill?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}