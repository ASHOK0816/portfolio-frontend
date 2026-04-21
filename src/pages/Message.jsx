import { useEffect, useState } from "react";
import api from "../api/api";
import "../style/Message.css";
import { FiTrash2, FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function Messages() {

    const [messages, setMessages] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);
    const perPage = 8;

    const colors = [
        "#4f46e5", "#6366f1", "#8b5cf6", "#a855f7",
        "#ec4899", "#f43f5e", "#ef4444", "#f97316",
        "#f59e0b", "#eab308", "#84cc16", "#22c55e",
        "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
        "#3b82f6", "#60a5fa", "#818cf8", "#c084fc"
    ];

    let lastColorIndex = -1;

    const getColor = (name) => {
        if (!name) return colors[0];

        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = (hash << 5) - hash + name.charCodeAt(i);
        }

        let index = Math.abs(hash) % colors.length;

        // 🚀 prevent same consecutive color
        if (index === lastColorIndex) {
            index = (index + 1) % colors.length;
        }

        lastColorIndex = index;

        return colors[index];
    };

    const highlightText = (text, keyword) => {
        if (!keyword) return text;

        const parts = text.split(new RegExp(`(${keyword})`, "gi"));

        return parts.map((part, i) =>
            part.toLowerCase() === keyword.toLowerCase() ? (
                <span key={i} className="highlight">{part}</span>
            ) : (
                part
            )
        );
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            if (search.trim()) {
                setPage(1); // reset pagination
            }
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    const handleKeyDown = (e) => {
        const list = processedMessages;

        if (!list.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev < list.length - 1 ? prev + 1 : 0
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) =>
                prev > 0 ? prev - 1 : list.length - 1
            );
        }

        if (e.key === "Enter" && activeIndex >= 0) {
            openMessage(list[activeIndex]);
        }
    };

    // 📄 PAGINATION
    const start = (page - 1) * perPage;

    // 📥 FETCH MESSAGES
    const fetchMessages = async () => {
        try {
            const res = await api.get("/messages");

            const sorted = res.data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setMessages(sorted);

        } catch {
            toast.error("Failed to load messages");
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const processedMessages = messages
        .filter((msg) => {
            if (filter === "read") return msg.read;
            if (filter === "unread") return !msg.read;
            if (filter === "starred") return msg.starred;
            return true;
        })
        // ✅ SEARCH
        .filter(
            (msg) =>
                msg.sender.toLowerCase().includes(search.toLowerCase()) ||
                msg.email.toLowerCase().includes(search.toLowerCase())
        )
        // ✅ SORT
        .sort((a, b) => {
            if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
            if (sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
            if (sort === "az") return a.sender.localeCompare(b.sender);
            if (sort === "za") return b.sender.localeCompare(a.sender);
            return 0;
        });

    // ⭐ STAR MESSAGE
    const toggleStar = async (msg) => {
        try {
            await api.put(`/messages/${msg.id}/star`);
            fetchMessages();
        } catch {
            toast.error("Failed to update star");
        }
    };

    // 📖 OPEN MESSAGE
    const openMessage = async (msg) => {
        setSelected(msg);

        if (!msg.read) {
            try {
                await api.put(`/messages/${msg.id}/read`);

                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === msg.id ? { ...m, read: true } : m
                    )
                );

                // update selected instantly
                setSelected((prev) =>
                    prev?.id === msg.id ? { ...prev, read: true } : prev
                );

            } catch {
                toast.error("Failed to mark read");
            }
        }
    };

    // 🗑 DELETE MESSAGE
    const deleteMessage = async (id) => {

        if (!window.confirm("Delete this message?")) return;

        try {

            await api.delete(`/messages/${id}`);

            toast.success("Message deleted");

            fetchMessages();

        } catch {

            toast.error("Delete failed");

        }
    };

    // 📅 GROUP BY DATE
    const groupMessages = () => {

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        const groups = {
            Today: [],
            Yesterday: [],
            Older: []
        };

        processedMessages.slice(start, start + perPage).forEach(msg => {

            const msgDate = new Date(msg.createdAt).toDateString();

            if (msgDate === today) groups.Today.push(msg);
            else if (msgDate === yesterday) groups.Yesterday.push(msg);
            else groups.Older.push(msg);

        });

        return groups;
    };

    const groups = groupMessages();

    return (
        <div className="app-container">

            <ToastContainer />

            <Sidebar />

            <div className="main-content">

                <Topbar />

                <div className="email-layout">

                    {/* LEFT PANEL */}
                    <div className="email-list">

                        <div className="filter-bar">

                            {/* FILTER */}
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All</option>
                                <option value="read">Read</option>
                                <option value="unread">Unread</option>
                                <option value="starred">Starred</option>
                            </select>

                            {/* SORT */}
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="filter-select"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="az">A → Z</option>
                                <option value="za">Z → A</option>
                            </select>

                        </div>

                        <div className="search-wrapper">

                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="search-input premium-search"
                                placeholder=" "   // ⚠️ must be empty for animation
                            />
                            <span className="search-placeholder"></span>
                        </div>

                        {Object.keys(groups).map(section => (

                            groups[section].length > 0 && (

                                <div key={section}>

                                    <h3 className="date-header">{section}</h3>

                                    {groups[section].map(msg => (

                                        <div
                                            key={msg.id}
                                            className={`email-item 
                                            ${msg.read ? "read" : "unread"} 
                                            ${selected?.id === msg.id ? "active" : ""}
                                          `}
                                            onClick={() => openMessage(msg)}
                                        >

                                            <div
                                                className="avatar"
                                                style={{ background: getColor(msg.sender || msg.email) }}
                                            >
                                                {msg.sender
                                                    ? (() => {
                                                        const parts = msg.sender.trim().split(" ").filter(Boolean);
                                                        return parts.length === 1
                                                            ? parts[0][0].toUpperCase()
                                                            : (parts[0][0] + parts[1][0]).toUpperCase();
                                                    })()
                                                    : "U"}
                                            </div>

                                            <div className="email-info">

                                                <div className="email-top">

                                                    <span className="sender">
                                                        {highlightText(msg.sender, search)}

                                                        {!msg.read && (
                                                            <span className="status unread">
                                                                ⚠️ Unread
                                                            </span>
                                                        )}

                                                        {msg.read && (
                                                            <span className="status read">
                                                                Opened
                                                            </span>
                                                        )}

                                                    </span>

                                                    {/* <span className="queue">
                                                        #{messages.findIndex(m => m.id === msg.id) + 1}
                                                    </span> */}

                                                    <span className="time">
                                                        {(() => {
                                                            const date = new Date(msg.createdAt);
                                                            const today = new Date().toDateString();

                                                            if (date.toDateString() === today) {
                                                                return date.toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                });
                                                            }

                                                            return date.toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                weekday: "short"
                                                            });
                                                        })()}
                                                    </span>

                                                </div>

                                                <p className="preview">
                                                    {highlightText(msg.content.substring(0, 60), search)}...
                                                </p>

                                            </div>

                                            {msg.starred ? (
                                                <FaStar
                                                    className="star active"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStar(msg);
                                                    }}
                                                />
                                            ) : (
                                                <FiStar
                                                    className="star"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleStar(msg);
                                                    }}
                                                />
                                            )}

                                            <FiTrash2
                                                className="delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteMessage(msg.id);
                                                }}
                                            />

                                        </div>

                                    ))}

                                </div>

                            )

                        ))}

                        {/* PAGINATION */}
                        <div className="pagination">

                            {Array.from({
                                length: Math.ceil(processedMessages.length / perPage)
                            }).map((_, i) => (

                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={page === i + 1 ? "active" : ""}
                                >
                                    {i + 1}
                                </button>

                            ))}

                        </div>

                    </div>

                    {/* RIGHT PANEL */}
                    <div className="email-view">

                        {selected ? (

                            <div className="message-view">

                                <h2>{selected.sender}</h2>

                                <p className="email">{selected.email}</p>

                                <span className="date">
                                    {new Date(selected.createdAt).toLocaleString()}
                                </span>

                                <hr />

                                <p className="message-text">
                                    {selected.content}
                                </p>

                            </div>

                        ) : (

                            <div className="empty-message">
                                Select a message to read 📩
                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
}