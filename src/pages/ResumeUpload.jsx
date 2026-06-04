import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import api from "../api/api";
import { toast } from "react-toastify";
import { FaUpload, FaEye, FaTrash } from "react-icons/fa";
import "../style/ResumeUpload.css";

export default function ResumeUpload() {
  const [resumeList, setResumeList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchResumes = async () => {
    try {
      const res = await api.get("/resume");
      setResumeList(res.data);
    } catch {
      toast.error("Failed to load resumes");
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  // ================= UPLOAD =================
  const uploadFile = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/resume/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percent);
        },
      });

      toast.success("Resume uploaded 🚀");
      setUploadProgress(0);
      fetchResumes();
    } catch {
      toast.error("Upload failed");
    }
  };

  // ================= DRAG DROP =================
  const handleDrop = (e) => {
    e.preventDefault();
    uploadFile(e.dataTransfer.files[0]);
  };

  // ================= DELETE =================
  const deleteResume = async (id) => {
    try {
      await api.delete(`/resume/${id}`);
      toast.success("Deleted");
      fetchResumes();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />

      <div className="admin-content">
        <Topbar />

        <div className="resume-upload-container">

          <h2 className="resume-header">Resume Manager</h2>

          {/* ================= DROP ZONE ================= */}
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <FaUpload size={22} />
            <p>Drag & Drop PDF here or click to upload</p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => uploadFile(e.target.files[0])}
            />
          </div>

          {/* ================= PROGRESS ================= */}
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}

          {/* ================= LIST ================= */}
          <div className="resume-grid">
            {resumeList
              .filter(file => file.folder === "resume")
              .map((res) => (
                <div key={res.id} className="resume-card">

                  <p>{res.fileName}</p>

                  <div className="resume-actions">

                    <FaEye
                      onClick={() =>
                        window.open(
                          `http://localhost:8080/api/resume/view/${res.id}`,
                          "_blank"
                        )
                      }
                      title="Preview"
                    />

                    <FaTrash
                      className="fa-trash"
                      onClick={() => deleteResume(res.id)}
                      title="Delete"
                    />

                    {res.uploadedAt && (
                      <p className="resume-category style-italic">
                        Uploaded on{" "}
                        {new Date(res.uploadedAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    )}

                  </div>

                </div>
              ))}
          </div>

          {/* ================= PDF PREVIEW ================= */}
          {previewUrl && (
            <div className="preview-modal" onClick={() => setPreviewUrl(null)}>
              <div
                className="preview-content"
                onClick={(e) => e.stopPropagation()}
              >
                <iframe
                  src={previewUrl}
                  title="Resume Preview"
                  width="100%"
                  height="700px"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}