import { useEffect, useState } from "react";
import api from "../api/api";
import { useCallback } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import "../style/Project.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});   // ✅ Fix 3: no factory fn

  const handleImageLoad = (id) => {
    setLoadedImages((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  };

  const emptyForm = {
    title: "",
    tech: "",
    description: "",
    githubUrl: "",
    imageName: "",
    image: null,   // ✅ Fix 2: track File object explicitly
  };

  const [form, setForm] = useState(emptyForm);

  const loadProjects = useCallback(async () => {
    try {
      const res = await api.get(`/projects?page=${page}&size=6`);
      setProjects(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects.");
    }
  }, [page]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        image: file,
        imageName: file.name,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!form.title || !form.tech) {
        toast.warning("Title and Tech are required!");
        return;
      }

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("tech", form.tech);
      formData.append("description", form.description ?? "");
      formData.append("githubUrl", form.githubUrl ?? "");

      if (form.image) {
        formData.append("image", form.image);
      }

      // ✅ Fix: removed manual Content-Type header from both calls.
      //    Axios sets it automatically with the correct boundary when
      //    it detects a FormData body. Setting it manually strips the
      //    boundary and breaks server-side parsing.
      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, formData);
        toast.success("Project updated successfully 🎉");
      } else {
        await api.post("/projects", formData);
        toast.success("Project added successfully 🚀");
      }

      setEditingProject(null);
      setForm(emptyForm);
      setShowModal(false);
      loadProjects();

    } catch (error) {
      console.error(error);

      if (error.response?.status === 400) {
        toast.error("Invalid data provided!");
      } else if (error.response?.status === 401) {
        toast.error("Session expired! Login again.");
      } else if (error.response?.status === 413) {
        // ✅ Added: image too large is a common silent failure
        toast.error("Image is too large. Please upload a smaller file.");
      } else {
        toast.error("Something went wrong while saving.");
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject({ ...project });
    setForm({
      title: project.title ?? "",
      tech: project.tech ?? "",
      description: project.description ?? "",
      githubUrl: project.githubUrl ?? "",
      imageName: project.imageName ?? "",
      image: null,   // ✅ Fix 2: no stale File object
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedId) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/projects/${selectedId}`, { skipLoader: true });
      setProjects((prev) => prev.filter((p) => p.id !== selectedId));
      toast.success("Project deleted successfully 🗑️");
      setShowDeleteModal(false);
      setSelectedId(null);
    } catch (error) {
      toast.error("Delete failed!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingProject(null);
    setForm(emptyForm);   // ✅ Fix 2: image cleared too
  };

  return (
    <div className="admin-layout page-root page-projects">
      <Sidebar />
      <div className="admin-content">
        <Topbar />

        <motion.div
          className="projects-card glass-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="projects-header">

            <div className="projects-title-wrapper">
              <h2 className="projects-title">Projects</h2>
              <p className="projects-subtitle">
                Manage and organize your portfolio projects.
              </p>
            </div>
            
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + New Project
            </button>
          </div>

          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="empty-state">
                <p className="no-project">No projects found 🚀</p>
              </div>
            ) : (
              projects.map((p) => (
                <motion.div
                  key={p.id}
                  className="project-card-modern glass-card"
                  whileHover={{ y: -6 }}
                >
                  <div className="project-image-wrapper">
                    {!loadedImages[p.id] && <div className="image-skeleton" />}
                    <img
                      src={p.imageName ? `${API_BASE}${p.imageName}` : "/no-image.png"}
                      onLoad={() => handleImageLoad(p.id)}
                      onError={(e) => (e.target.src = "/no-image.png")}
                      loading="lazy"
                      alt={p.title}
                      className={`project-image ${loadedImages[p.id] ? "loaded" : ""}`}
                    />
                  </div>

                  {/* ✅ project-content starts here */}
                  <div className="project-content">
                    <h3 className="heading-card">{p.title}</h3>

                    <div className="flex gap-sm" style={{ flexWrap: "wrap", marginBottom: "10px" }}>
                      {p.tech.split(",").map((t, i) => (
                        <span key={i} className="badge">
                          {t.trim()}
                        </span>
                      ))}
                    </div>

                    {p.githubUrl && (
                  <a                    href = { p.githubUrl }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="github-btn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 98 96"
                      fill="currentColor"
                    >
                    <path d="M49 1C22 1 0 23 0 50c0 21 14 39 33 45 2 .5 3-1 3-2v-7c-14 3-17-6-17-6-2-5-5-7-5-7-4-3 0-3 0-3 5 0 7 5 7 5 4 7 10 5 13 4 0-3 2-5 3-6-10-1-20-5-20-22 0-5 2-9 5-13-1-1-2-6 0-13 0 0 4-1 13 5 4-1 8-2 12-2s8 1 12 2c9-6 13-5 13-5 2 7 1 12 0 13 3 4 5 8 5 13 0 17-10 21-20 22 2 1 3 4 3 8v12c0 1 1 3 3 2 19-6 33-24 33-45C98 23 76 1 49 1z" />
                    </svg>
                    View on GitHub
                  </a>
                )}

                  <p className="project-description">
                    {p.description?.length > 150
                      ? p.description.slice(0, 150) + "…"
                      : p.description}
                  </p>

                  {/* ✅ Buttons are INSIDE project-content — this was the bug */}
                  <div className="project-actions-modern">
                    <button
                      className="btn btn-gold"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(p.id)}
                    >
                      Delete
                    </button>
                  </div>

                </div>
    {/* ✅ project-content closes here, AFTER the buttons */ }

  </motion.div>
        ))
            )}
      </div>

      {/* ✅ Fix 5: Pagination UI */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-secondary"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {page + 1} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </motion.div>

        {/* Modal */ }
  {
    showModal && (
      <div className="modal-overlay">
        <motion.div
          className="modal glass-card"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <h3 className="modal-edit">
            {editingProject ? "Edit Project" : "Add Project"}
          </h3>

          <input
            className="input"
            style={{ padding: "6px" }}
            type="text"
            name="title"
            placeholder="Title"
            value={form.title || ""}
            onChange={handleChange}
            required
          />
          <input
            className="input"
            style={{ padding: "6px" }}
            type="text"
            name="tech"
            placeholder="Tech (React, Spring Boot...)"
            value={form.tech || ""}
            onChange={handleChange}
          />
          <input
            className="input"
            style={{ padding: "6px" }}
            type="url"
            name="githubUrl"
            placeholder="GitHub URL"
            value={form.githubUrl || ""}
            onChange={handleChange}
          />
          <textarea
            className="input"
            style={{ padding: "6px" }}
            name="description"
            placeholder="Description"
            value={form.description || ""}
            onChange={handleChange}
          />
          <input
            className="input"
            style={{ padding: "6px" }}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <div className="modal-actions">
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProject ? "Update" : "Add"}
            </button>
            <button className="btn btn-secondary" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  <ConfirmModal
    isOpen={showDeleteModal}
    onClose={() => setShowDeleteModal(false)}
    onConfirm={confirmDelete}
    title="Delete Project?"
    message="This will permanently delete the selected project."
    confirmText="Yes, Delete"
    cancelText="Cancel"
    type="danger"
    loading={deleteLoading}
  />
      </div >
    </div >
  );
}