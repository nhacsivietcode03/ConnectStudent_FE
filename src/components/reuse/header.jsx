import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useSocket } from "../../contexts/SocketContext";
import { Image, Dropdown } from "react-bootstrap";
import { sendFollowRequest } from "../../api/follow.api";
import client from "../../api/client";
import {
    fetchNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../../api/notification.api";

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);

    // Load initial data
    useEffect(() => {
        if (isAuthenticated && user) {
            loadNotifications();
            loadUnreadCount();
        }
    }, [isAuthenticated, user]);

    // Socket event listeners for realtime updates
    useEffect(() => {
        if (socket && isConnected) {
            // Listen for new notifications
            socket.on('new-notification', (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);
            });

            // Listen for unread count updates
            socket.on('unread-count-update', () => {
                loadUnreadCount();
            });

            return () => {
                socket.off('new-notification');
                socket.off('unread-count-update');
            };
        }
    }, [socket, isConnected]);

    const loadNotifications = async () => {
        try {
            const { data } = await fetchNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    const loadUnreadCount = async () => {
        try {
            const { data } = await getUnreadCount();
            setUnreadCount(data.count || 0);
        } catch (error) {
            console.error("Failed to load unread count", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            try {
                await markAsRead(notification._id);
                setNotifications((prev) =>
                    prev.map((n) =>
                        n._id === notification._id ? { ...n, read: true } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
        setShowDropdown(false);
        navigate("/");
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const goToPostFromNotification = (notification) => {
        const postId = notification?.post?._id || notification?.post;
        if (postId) {
            navigate(`/posts/${postId}`);
        } else {
            navigate("/");
        }
    };

    const formatTimeAgo = (date) => {
        if (!date) return "";
        const now = new Date();
        const then = new Date(date);
        const diffInSeconds = Math.floor((now - then) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600)
            return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400)
            return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    };

    const getNotificationText = (notification) => {
        const senderName =
            notification.sender?.username ||
            notification.sender?.email ||
            "Someone";
        if (notification.type === "like") {
            return `${senderName} liked your post`;
        } else if (notification.type === "comment") {
            return `${senderName} commented on your post`;
        } else if (notification.type === "reply") {
            return `${senderName} replied to your comment`;
        } else if (notification.type === "follow_request") {
            return `${senderName} sent you a follow request`;
        } else if (notification.type === "follow_accept") {
            return `${senderName} accepted your follow request`;
        } else if (notification.type === "follow_reject") {
            return `${senderName} rejected your follow request`;
        } else if (notification.type === "banned") {
            const reason = notification.metadata?.reason || "Violation of terms";
            return `Your account has been restricted. Reason: ${reason}`;
        } else if (notification.type === "unbanned") {
            return `Your account has been restored with full access`;
        } else if (notification.type === "role_updated") {
            const oldRole = notification.metadata?.oldRole === "admin" ? "Administrator" : "Student";
            const newRole = notification.metadata?.newRole === "admin" ? "Administrator" : "Student";
            return `Your role has been changed from ${oldRole} to ${newRole}`;
        }
        return "You have a new notification";
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // User search
    useEffect(() => {
        const handler = setTimeout(async () => {
            const term = searchTerm.trim();
            if (!term) {
                setSearchResults([]);
                setShowSearch(false);
                return;
            }
            try {
                setSearching(true);
                // Simple search via user list then filter on client
                const { data } = await client.get("/users/getUser");
                const normalized = (data || []).filter(
                    (u) =>
                        (u.username && u.username.toLowerCase().includes(term.toLowerCase())) ||
                        (u.email && u.email.toLowerCase().includes(term.toLowerCase()))
                );
                // Exclude self
                const filtered = normalized.filter((u) => String(u._id) !== String(user?._id));
                setSearchResults(filtered.slice(0, 8));
                setShowSearch(true);
            } catch (e) {
                setSearchResults([]);
                setShowSearch(false);
            } finally {
                setSearching(false);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm, user]);

    const handleFollow = async (targetId) => {
        try {
            await sendFollowRequest(targetId);
            setSearchResults((prev) => prev.map((u) => (u._id === targetId ? { ...u, __requested: true } : u)));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot send follow request";
            alert(errorMessage);
        }
    };

    return (
        <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-primary text-white shadow">
            <h1
                className="fs-3 fw-bold mb-0"
                style={{ cursor: "pointer" }}
                onClick={() => {
                    if (user?.role === "admin") {
                        navigate("/admin");
                    } else {
                        navigate("/");
                    }
                }}
            >
                UniConnect
            </h1>

            {user?.role !== "admin" && (
                <nav className="d-flex gap-4 align-items-center position-relative" style={{ flex: 1, marginLeft: 48, marginRight: 24 }}>
                    <Link to="/" className="text-white text-decoration-none">
                        Home
                    </Link>
                    <button
                        className="btn btn-link text-white text-decoration-none p-0 border-0"
                        style={{ textDecoration: "none" }}
                    >
                        Group
                    </button>
                    <button
                        className="btn btn-link text-white text-decoration-none p-0 border-0"
                        style={{ textDecoration: "none" }}
                        onClick={() => navigate("/friends")}
                    >
                        Friends
                    </button>
                    <div className="ms-auto" style={{ position: "relative", minWidth: 260, maxWidth: 360, width: "100%" }}>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowSearch(true)}
                            onBlur={() => setTimeout(() => setShowSearch(false), 150)}
                        />
                        {showSearch && (
                            <div
                                className="bg-white text-dark border rounded shadow-sm"
                                style={{ position: "absolute", top: "110%", left: 0, right: 0, zIndex: 1050, maxHeight: 320, overflowY: "auto" }}
                            >
                                {searching ? (
                                    <div className="p-2 text-muted">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="p-2 text-muted">No users found</div>
                                ) : (
                                    searchResults.map((u) => (
                                        <div key={u._id} className="d-flex align-items-center justify-content-between p-2 border-bottom">
                                            <div className="d-flex align-items-center gap-2">
                                                {u.avatar ? (
                                                    <img src={u.avatar} alt="" className="rounded-circle" style={{ width: 32, height: 32, objectFit: "cover" }} />
                                                ) : (
                                                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, fontSize: 12 }}>
                                                        {(u.username?.charAt(0) || u.email?.charAt(0) || "U").toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="small">
                                                    <div className="fw-semibold">{u.username || u.email}</div>
                                                    <div className="text-muted">{u.email}</div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                disabled={u.__requested}
                                                onClick={() => handleFollow(u._id)}
                                            >
                                                {u.__requested ? "Sent" : "Follow"}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </nav>
            )}

            {isAuthenticated && user ? (
                <div className="d-flex align-items-center gap-3">
                    {/* Notification Bell */}
                    <Dropdown
                        show={showDropdown}
                        onToggle={(isOpen) => {
                            setShowDropdown(isOpen);
                            if (isOpen) {
                                loadNotifications();
                            }
                        }}
                    >
                        <Dropdown.Toggle
                            as="div"
                            style={{
                                cursor: "pointer",
                                position: "relative",
                                padding: "8px",
                            }}
                        >
                            <i
                                className="bi bi-bell-fill text-white"
                                style={{ fontSize: "1.5rem" }}
                            ></i>
                            {unreadCount > 0 && (
                                <span
                                    className="badge bg-danger rounded-circle position-absolute top-0 start-100 translate-middle"
                                    style={{
                                        fontSize: "0.7rem",
                                        minWidth: "18px",
                                        height: "18px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            )}
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            style={{
                                width: "350px",
                                maxHeight: "500px",
                                overflowY: "auto",
                            }}
                            align="end"
                        >
                            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                                <h6 className="mb-0 fw-bold">Notifications</h6>
                                {unreadCount > 0 && (
                                    <button
                                        className="btn btn-link btn-sm p-0 text-primary"
                                        onClick={handleMarkAllAsRead}
                                        style={{ fontSize: "0.85rem" }}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                            {notifications.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i
                                        className="bi bi-bell-slash"
                                        style={{ fontSize: "2rem" }}
                                    ></i>
                                    <p className="mt-2 mb-0">No notifications</p>
                                </div>
                            ) : (
                                <>
                                    {notifications.map((notification) => (
                                        <Dropdown.Item
                                            key={notification._id}
                                            onClick={() => {
                                                handleNotificationClick(notification);
                                                goToPostFromNotification(notification);
                                            }
                                            }
                                            style={{
                                                backgroundColor: notification.read
                                                    ? "white"
                                                    : "#e7f3ff",
                                                padding: "12px",
                                                borderBottom: "1px solid #f0f0f0",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    notification.read
                                                        ? "#f8f9fa"
                                                        : "#d0e7ff";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    notification.read
                                                        ? "white"
                                                        : "#e7f3ff";
                                            }}
                                        >
                                            <div className="d-flex gap-2">
                                                {notification.sender?.avatar ? (
                                                    <Image
                                                        src={notification.sender.avatar}
                                                        roundedCircle
                                                        width={40}
                                                        height={40}
                                                        style={{
                                                            objectFit: "cover",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {(
                                                            notification.sender
                                                                ?.username?.charAt(0) ||
                                                            notification.sender
                                                                ?.email?.charAt(0) ||
                                                            "U"
                                                        ).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-grow-1">
                                                    <div
                                                        className="d-flex justify-content-between align-items-start"
                                                        style={{ fontSize: "0.9rem" }}
                                                    >
                                                        <div>
                                                            <div className="fw-semibold">
                                                                {getNotificationText(
                                                                    notification
                                                                )}
                                                            </div>
                                                            <div
                                                                className="text-muted"
                                                                style={{ fontSize: "0.8rem" }}
                                                            >
                                                                {formatTimeAgo(
                                                                    notification.createdAt
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!notification.read && (
                                                            <span
                                                                className="badge bg-primary rounded-circle"
                                                                style={{
                                                                    width: "8px",
                                                                    height: "8px",
                                                                    flexShrink: 0,
                                                                    marginTop: "4px",
                                                                }}
                                                            ></span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Dropdown.Item>
                                    ))}
                                </>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>

                    <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/profile")}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = "0.8";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                        }}
                    >
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt="Avatar"
                                className="rounded-circle"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "cover",
                                    border: "2px solid white",
                                }}
                            />
                        ) : (
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center bg-white text-primary fw-bold"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    fontSize: "1.2rem",
                                }}
                            >
                                {(user.username || user.email || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}
                        <span className="text-white">
                            Welcome, <strong>{user.username || user.email}</strong>
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-light text-primary fw-semibold"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <Link to="/login" className="btn btn-light text-primary fw-semibold">
                    Login
                </Link>
            )}
        </header>
    );
}

export default Header;
