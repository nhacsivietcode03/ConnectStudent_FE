import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { userAPI } from "../../api/user.api";
import { authAPI } from "../../api/auth.api";
import Header from "../reuse/header";
import { Image } from "react-bootstrap";
import { fetchPosts, createPost, updatePost, deletePost, createComment } from "../../api/post.api";
import { useAuth } from "../../contexts/AuthContext";

function UserProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    useEffect(() => {
        document.title = "Profile - ConnectStudent";
    }, []);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        major: "",
        avatar: "",
        bio: "",
        createdAt: "",
    });
    const [editData, setEditData] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [changingPassword, setChangingPassword] = useState(false);

    // My posts
    const [userId, setUserId] = useState(null);
    const [myPosts, setMyPosts] = useState([]);
    const [loadingMyPosts, setLoadingMyPosts] = useState(true);
    // Post create/edit
    const [creating, setCreating] = useState(false);
    const [newContent, setNewContent] = useState("");
    const [newFiles, setNewFiles] = useState([]);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editFiles, setEditFiles] = useState([]);
    const [editKeepMedia, setEditKeepMedia] = useState([]);
    const fileInputRef = React.useRef(null);
    const editFileInputRef = React.useRef(null);
    const [commentDrafts, setCommentDrafts] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await client.get("/auth/me");
                if (response.data.success) {
                    const profileData = response.data.data;
                    setUserId(profileData._id);
                    setUserData({
                        username: profileData.username || "",
                        email: profileData.email || "",
                        major: profileData.major || "",
                        avatar: profileData.avatar || "",
                        bio: profileData.bio || "",
                        createdAt: profileData.createdAt || "",
                    });
                } else {
                    setError("Không thể tải thông tin người dùng.");
                }
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message ||
                    "Không thể tải thông tin người dùng. Vui lòng thử lại sau.";
                setError(errorMessage);
                console.error("Error fetching profile:", err);
                // Nếu lỗi 401 redirect về login
                if (err.response?.status === 401) {
                    setTimeout(() => {
                        navigate("/login");
                    }, 2000);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    useEffect(() => {
        const loadMyPosts = async () => {
            try {
                setLoadingMyPosts(true);
                const { data } = await fetchPosts();
                const mine = (data || []).filter((p) => p.author?._id === userId);
                setMyPosts(mine);
            } catch (err) {
                console.error("Failed to load posts", err);
            } finally {
                setLoadingMyPosts(false);
            }
        };
        if (userId) {
            loadMyPosts();
        }
    }, [userId]);

    const renderMedia = (media = []) => {
        if (!media.length) return null;
        return (
            <div className="mt-2 d-flex flex-column gap-2">
                {media.map((item) => (
                    <div key={item.publicId}>
                        {item.resourceType === "video" ? (
                            <video
                                controls
                                style={{ width: "100%", borderRadius: "8px" }}
                                src={item.url}
                            />
                        ) : (
                            <img
                                src={item.url}
                                alt="post-media"
                                style={{ width: "100%", borderRadius: "8px" }}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderEditMedia = (post) => {
        return (
            <div className="mb-3">
                <div className="fw-semibold mb-1">Ảnh/Video hiện có</div>
                <div className="d-flex flex-wrap gap-3">
                    {post.media?.map((item) => {
                        const checked = editKeepMedia.includes(item.publicId);
                        return (
                            <div
                                key={item.publicId}
                                className="border rounded p-2 position-relative"
                                style={{ width: 140 }}
                            >
                                <div className="form-check mb-2">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`${post._id}-${item.publicId}`}
                                        checked={checked}
                                        onChange={(e) => {
                                            const next = e.target.checked
                                                ? [...editKeepMedia, item.publicId]
                                                : editKeepMedia.filter(
                                                      (id) => id !== item.publicId
                                                  );
                                            setEditKeepMedia(next);
                                        }}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor={`${post._id}-${item.publicId}`}
                                    >
                                        Giữ lại
                                    </label>
                                </div>
                                {item.resourceType === "video" ? (
                                    <video
                                        src={item.url}
                                        style={{ width: "100%", borderRadius: "6px" }}
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={item.url}
                                        alt="media"
                                        style={{
                                            width: "100%",
                                            borderRadius: "6px",
                                            objectFit: "cover",
                                            aspectRatio: "1/1",
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderNewFilesPreview = (files, setFiles) => {
        if (!files.length) return null;
        return (
            <div className="mt-2 d-flex flex-column gap-2">
                <div className="fw-semibold">Tệp đính kèm mới</div>
                <ul className="list-unstyled mb-0">
                    {files.map((file, idx) => (
                        <li
                            key={`${file.name}-${idx}`}
                            className="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1"
                        >
                            <span className="text-truncate" style={{ maxWidth: 260 }}>
                                {file.name}
                            </span>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                    setFiles((prev) => prev.filter((_, index) => index !== idx))
                                }
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const resetCreateForm = () => {
        setNewContent("");
        setNewFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const resetEditForm = () => {
        setEditingPostId(null);
        setEditContent("");
        setEditFiles([]);
        setEditKeepMedia([]);
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newContent.trim() && newFiles.length === 0) return;
        setCreating(true);
        const formData = new FormData();
        formData.append("content", newContent);
        newFiles.forEach((file) => formData.append("media", file));
        try {
            const { data } = await createPost(formData);
            setMyPosts((prev) => [data, ...prev]);
            resetCreateForm();
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "Không thể đăng bài";
            alert(errorMessage);
        } finally {
            setCreating(false);
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post._id);
        setEditContent(post.content || "");
        setEditFiles([]);
        setEditKeepMedia(post.media?.map((m) => m.publicId) || []);
        if (editFileInputRef.current) {
            editFileInputRef.current.value = "";
        }
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("content", editContent);
        formData.append("keepMedia", JSON.stringify(editKeepMedia));
        editFiles.forEach((file) => formData.append("media", file));
        try {
            const { data } = await updatePost(editingPostId, formData);
            setMyPosts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
            resetEditForm();
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "Không thể cập nhật bài viết";
            alert(errorMessage);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
        try {
            await deletePost(postId);
            setMyPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || error.message || "Không thể xóa bài viết";
            alert(errorMessage);
        }
    };
    const handleEdit = () => {
        if (!isEditing) {
            setEditData({ ...userData });
        }
        setIsEditing(!isEditing);
    };

    const handleUpdate = async () => {
        if (!editData) return;

        // Validate required fields
        const errors = {};
        if (!editData.username || !editData.username.trim()) {
            errors.username = "Vui lòng nhập tên người dùng!";
        }
        if (!editData.email || !editData.email.trim()) {
            errors.email = "Vui lòng nhập email!";
        }
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const payload = {
                username: editData.username,
                email: editData.email,
                major: editData.major || "",
                avatar: editData.avatar || "",
                bio: editData.bio || "",
            };

            const response = await client.put("/users/profile", payload);

            if (response.data.success) {
                setUserData(editData);
                setIsEditing(false);
                setEditData(null);
                setSuccessMsg("Cập nhật thông tin thành công!");
                // Sync AuthContext and localStorage so Header updates immediately
                const nextUser = {
                    ...(user || {}),
                    username: editData.username,
                    email: editData.email,
                    major: editData.major || "",
                    avatar: editData.avatar || "",
                    bio: editData.bio || "",
                };
                updateUser(nextUser);
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                "Không thể cập nhật thông tin. Vui lòng thử lại sau.";
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setLoading(false);
            setFieldErrors({});
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditData(null);
        setFieldErrors({});
    };

    const handleChangePassword = () => {
        setShowChangePasswordModal(true);
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setPasswordErrors({});
        setError(null);
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSubmitChangePassword = async () => {
        const errors = {};

        // Validate current password
        if (!passwordData.currentPassword || !passwordData.currentPassword.trim()) {
            errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại!";
        }

        // Validate new password
        if (!passwordData.newPassword || !passwordData.newPassword.trim()) {
            errors.newPassword = "Vui lòng nhập mật khẩu mới!";
        } else {
            // Check minimum length
            if (passwordData.newPassword.length < 6) {
                errors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự!";
            } else {
                // Check for at least one uppercase letter
                const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
                // Check for at least one special character
                const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
                    passwordData.newPassword
                );

                if (!hasUpperCase) {
                    errors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự hoa!";
                } else if (!hasSpecialChar) {
                    errors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt!";
                }
            }
        }

        // Validate confirm password
        if (!passwordData.confirmPassword || !passwordData.confirmPassword.trim()) {
            errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới!";
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = "Mật khẩu xác nhận không khớp!";
        }

        // Check if new password is same as current
        if (
            passwordData.currentPassword &&
            passwordData.newPassword &&
            passwordData.currentPassword === passwordData.newPassword
        ) {
            errors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại!";
        }

        setPasswordErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        try {
            setChangingPassword(true);
            setError(null);
            // Giả định authAPI.changePassword trả về đối tượng có thuộc tính 'success'
            const response = await authAPI.changePassword(
                passwordData.currentPassword,
                passwordData.newPassword
            );

            if (response.success) {
                setSuccessMsg("Đổi mật khẩu thành công!");
                setShowChangePasswordModal(false);
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                });
                setPasswordErrors({});
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Không thể đổi mật khẩu. Vui lòng thử lại sau.";
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleClosePasswordModal = () => {
        setShowChangePasswordModal(false);
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setPasswordErrors({});
        setError(null);
    };

    const handleAvatarClick = () => {
        setShowAvatarModal(true);
        setAvatarPreview(null);
        setSelectedFile(null);
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Vui lòng chọn file ảnh hợp lệ!");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Kích thước file không được vượt quá 5MB!");
            return;
        }

        setSelectedFile(file);
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = async () => {
        if (!selectedFile) {
            setError("Vui lòng chọn ảnh để upload!");
            return;
        }

        try {
            setUploadingAvatar(true);
            setError(null);
            const response = await userAPI.uploadAvatar(selectedFile);

            if (response.success) {
                setUserData((prev) => ({
                    ...prev,
                    avatar: response.data.avatar,
                }));
                if (editData) {
                    setEditData((prev) => ({
                        ...prev,
                        avatar: response.data.avatar,
                    }));
                }
                setSuccessMsg("Upload avatar thành công!");
                setShowAvatarModal(false);
                setAvatarPreview(null);
                setSelectedFile(null);
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Không thể upload avatar. Vui lòng thử lại sau.";
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleCloseModal = () => {
        setShowAvatarModal(false);
        setAvatarPreview(null);
        setSelectedFile(null);
        setError(null);
    };

    useEffect(() => {
        if (successMsg) {
            const timer = setTimeout(() => setSuccessMsg(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [successMsg]);

    if (loading && !userData.username && !error) {
        return (
            <div
                className="min-vh-100 d-flex align-items-center justify-content-center"
                style={{ background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)" }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border text-white mb-3"
                        role="status"
                        style={{ width: "3rem", height: "3rem" }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-white fs-5">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-vh-100"
            style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}
        >
            <Header />
            {successMsg && (
                <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3"
                    style={{ maxWidth: "500px", width: "90%" }}
                >
                    <div
                        className="alert alert-success alert-dismissible fade show shadow-lg"
                        role="alert"
                        style={{ borderRadius: "12px", border: "none" }}
                    >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {successMsg}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccessMsg(null)}
                        ></button>
                    </div>
                </div>
            )}
            {error && (
                <div
                    className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3"
                    style={{ maxWidth: "500px", width: "90%" }}
                >
                    <div
                        className="alert alert-danger alert-dismissible fade show shadow-lg"
                        role="alert"
                        style={{ borderRadius: "12px", border: "none" }}
                    >
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                </div>
            )}
            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        {/* Profile Header Card */}
                        <div
                            className="card shadow-lg mb-4"
                            style={{ borderRadius: "20px", border: "none", overflow: "hidden" }}
                        >
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                                    padding: "3rem 2rem 2rem",
                                    position: "relative",
                                }}
                            >
                                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                                    <div className="d-flex align-items-center gap-4">
                                        <div style={{ position: "relative" }}>
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                                style={{
                                                    width: "120px",
                                                    height: "120px",
                                                    background: "white",
                                                    border: "5px solid white",
                                                    overflow: "hidden",
                                                    transition: "transform 0.3s ease",
                                                    cursor: "pointer",
                                                }}
                                                onClick={handleAvatarClick}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = "scale(1.05)";
                                                    e.currentTarget.style.opacity = "0.9";
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = "scale(1)";
                                                    e.currentTarget.style.opacity = "1";
                                                }}
                                            >
                                                {userData.avatar ? (
                                                    <img
                                                        src={userData.avatar}
                                                        alt="Avatar"
                                                        className="rounded-circle"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        className="text-primary fw-bold"
                                                        style={{ fontSize: "3rem" }}
                                                    >
                                                        {userData.username
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "U"}
                                                    </span>
                                                )}
                                            </div>
                                            <div
                                                className="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                                                style={{
                                                    width: "36px",
                                                    height: "36px",
                                                    border: "3px solid white",
                                                    cursor: "pointer",
                                                }}
                                                onClick={handleAvatarClick}
                                                title="Thay đổi ảnh đại diện"
                                            >
                                                <i className="bi bi-camera-fill"></i>
                                            </div>
                                        </div>
                                        <div className="text-white">
                                            <h2
                                                className="mb-2 fw-bold"
                                                style={{ fontSize: "2rem" }}
                                            >
                                                {userData.username || "Chưa có tên"}
                                            </h2>
                                            <p
                                                className="mb-1"
                                                style={{ opacity: 0.9, fontSize: "1rem" }}
                                            >
                                                <i className="bi bi-envelope me-2"></i>
                                                {userData.email}
                                            </p>
                                            <p
                                                className="mb-0"
                                                style={{ opacity: 0.8, fontSize: "0.9rem" }}
                                            >
                                                <i className="bi bi-calendar3 me-2"></i>
                                                Thành viên từ{" "}
                                                {userData.createdAt
                                                    ? new Date(
                                                          userData.createdAt
                                                      ).toLocaleDateString("vi-VN", {
                                                          month: "long",
                                                          year: "numeric",
                                                      })
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="d-flex flex-column gap-2"
                                        style={{ width: "100%", maxWidth: "200px" }}
                                    >
                                        <button
                                            onClick={handleChangePassword}
                                            className="btn btn-light fw-semibold"
                                            style={{ borderRadius: "10px", border: "none" }}
                                        >
                                            <i className="bi bi-key me-2"></i>
                                            Đổi mật khẩu
                                        </button>
                                        <button
                                            onClick={handleEdit}
                                            className={`btn fw-semibold ${
                                                isEditing ? "btn-secondary" : "btn-warning"
                                            }`}
                                            style={{ borderRadius: "10px", border: "none" }}
                                        >
                                            <i
                                                className={`bi ${
                                                    isEditing ? "bi-x-circle" : "bi-pencil"
                                                } me-2`}
                                            ></i>
                                            {isEditing ? "Cancel" : "Edit"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Information Card */}
                        <div
                            className="card shadow-lg"
                            style={{ borderRadius: "20px", border: "none" }}
                        >
                            <div className="card-body p-4 p-md-5">
                                <h4 className="mb-4 fw-bold text-primary">
                                    <i className="bi bi-person-circle me-2"></i>
                                    Thông tin cá nhân
                                </h4>

                                {/* Username Field */}
                                <div className="mb-4">
                                    <label
                                        className="form-label fw-semibold mb-2"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        <i className="bi bi-person me-2 text-primary"></i>
                                        Tên người dùng
                                    </label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                className={`form-control form-control-lg ${
                                                    fieldErrors.username ? "is-invalid" : ""
                                                }`}
                                                style={{ borderRadius: "10px", borderWidth: "2px" }}
                                                value={editData?.username || ""}
                                                onChange={(e) => {
                                                    setEditData((editData) =>
                                                        editData
                                                            ? {
                                                                  ...editData,
                                                                  username: e.target.value,
                                                              }
                                                            : null
                                                    );
                                                    setFieldErrors((errors) => ({
                                                        ...errors,
                                                        username: undefined,
                                                    }));
                                                }}
                                                placeholder="Nhập tên người dùng"
                                            />
                                            {fieldErrors.username && (
                                                <div className="invalid-feedback d-block">
                                                    {fieldErrors.username}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div
                                            className="p-3 bg-light rounded"
                                            style={{ borderRadius: "10px" }}
                                        >
                                            <p className="mb-0 fw-medium">
                                                {userData.username || "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div className="mb-4">
                                    <label
                                        className="form-label fw-semibold mb-2"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        <i className="bi bi-envelope me-2 text-primary"></i>
                                        Email
                                    </label>
                                    <div
                                        className="p-3 bg-light rounded"
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <p className="mb-0 fw-medium">{userData.email}</p>
                                    </div>
                                    {isEditing && fieldErrors.email && (
                                        <div className="text-danger small mt-1">
                                            {fieldErrors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Major Field */}
                                <div className="mb-4">
                                    <label
                                        className="form-label fw-semibold mb-2"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        <i className="bi bi-book me-2 text-primary"></i>
                                        Chuyên ngành
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-control form-control-lg"
                                            style={{ borderRadius: "10px", borderWidth: "2px" }}
                                            value={editData?.major || ""}
                                            onChange={(e) =>
                                                setEditData((editData) =>
                                                    editData
                                                        ? { ...editData, major: e.target.value }
                                                        : null
                                                )
                                            }
                                            placeholder="Nhập chuyên ngành"
                                        />
                                    ) : (
                                        <div
                                            className="p-3 bg-light rounded"
                                            style={{ borderRadius: "10px" }}
                                        >
                                            <p className="mb-0 fw-medium">
                                                {userData.major || "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Bio Field */}
                                <div className="mb-4">
                                    <label
                                        className="form-label fw-semibold mb-2"
                                        style={{ fontSize: "1rem" }}
                                    >
                                        <i className="bi bi-card-text me-2 text-primary"></i>
                                        Giới thiệu
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            className="form-control form-control-lg"
                                            style={{
                                                borderRadius: "10px",
                                                borderWidth: "2px",
                                                minHeight: "120px",
                                            }}
                                            rows="4"
                                            value={editData?.bio || ""}
                                            onChange={(e) =>
                                                setEditData((editData) =>
                                                    editData
                                                        ? { ...editData, bio: e.target.value }
                                                        : null
                                                )
                                            }
                                            placeholder="Nhập giới thiệu về bản thân..."
                                        />
                                    ) : (
                                        <div
                                            className="p-3 bg-light rounded"
                                            style={{ borderRadius: "10px", minHeight: "80px" }}
                                        >
                                            <p
                                                className="mb-0 fw-medium"
                                                style={{ whiteSpace: "pre-wrap" }}
                                            >
                                                {userData.bio || "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="d-flex gap-3 mt-4 pt-4 border-top">
                                        <button
                                            onClick={handleUpdate}
                                            className="btn btn-primary flex-fill py-3 fw-semibold"
                                            disabled={loading}
                                            style={{ borderRadius: "12px", fontSize: "1rem" }}
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-circle me-2"></i>
                                                    Save changes
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="btn btn-outline-secondary flex-fill py-3 fw-semibold"
                                            style={{ borderRadius: "12px", fontSize: "1rem" }}
                                        >
                                            <i className="bi bi-x-circle me-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* My Posts */}
                <div className="container pb-4">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-xl-8">
                            <div
                                className="card shadow-lg mt-2"
                                style={{ borderRadius: "20px", border: "none" }}
                            >
                                <div className="card-body p-4 p-md-5">
                                    <h4 className="mb-4 fw-bold text-primary d-flex align-items-center">
                                        <i className="bi bi-chat-left-text me-2"></i>
                                        Bài viết của tôi
                                    </h4>
                                    {/* Create post */}
                                    <form onSubmit={handleCreatePost} className="mb-4">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Create Post
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows={3}
                                                placeholder="What's on your mind?"
                                                value={newContent}
                                                onChange={(e) => setNewContent(e.target.value)}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Image or Video</label>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                ref={fileInputRef}
                                                className="form-control"
                                                onChange={(e) =>
                                                    setNewFiles(Array.from(e.target.files || []))
                                                }
                                            />
                                            {renderNewFilesPreview(newFiles, setNewFiles)}
                                        </div>
                                        <div className="d-flex justify-content-end">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={creating}
                                            >
                                                {creating ? "Posting..." : "Post"}
                                            </button>
                                        </div>
                                    </form>

                                    {loadingMyPosts ? (
                                        <div className="d-flex justify-content-center py-4">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : myPosts.length === 0 ? (
                                        <p className="text-muted mb-0">Bạn chưa có bài viết nào.</p>
                                    ) : (
                                        <div className="d-flex flex-column gap-4">
                                            {myPosts.map((post) => {
                                                const isEditingPost = editingPostId === post._id;
                                                return (
                                                    <div key={post._id} className="card shadow-sm">
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between">
                                                                <div className="d-flex align-items-center gap-2">
                                                                    {post.author?.avatar ? (
                                                                        <Image
                                                                            src={post.author.avatar}
                                                                            roundedCircle
                                                                            width={40}
                                                                            height={40}
                                                                            style={{
                                                                                objectFit: "cover",
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: 40,
                                                                                height: 40,
                                                                            }}
                                                                        >
                                                                            {(
                                                                                post.author?.username?.charAt(
                                                                                    0
                                                                                ) ||
                                                                                post.author?.email?.charAt(
                                                                                    0
                                                                                ) ||
                                                                                "U"
                                                                            ).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <strong>
                                                                            {post.author
                                                                                ?.username ||
                                                                                post.author?.email}
                                                                        </strong>
                                                                        <div
                                                                            className="text-muted"
                                                                            style={{
                                                                                fontSize: "0.85rem",
                                                                            }}
                                                                        >
                                                                            {new Date(
                                                                                post.createdAt
                                                                            ).toLocaleString(
                                                                                "vi-VN",
                                                                                {
                                                                                    hour12: false,
                                                                                    year: "numeric",
                                                                                    month: "2-digit",
                                                                                    day: "2-digit",
                                                                                    hour: "2-digit",
                                                                                    minute: "2-digit",
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {!isEditingPost && (
                                                                    <div className="d-flex gap-2">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary"
                                                                            onClick={() =>
                                                                                startEditing(post)
                                                                            }
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() =>
                                                                                handleDeletePost(
                                                                                    post._id
                                                                                )
                                                                            }
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {!isEditingPost && (
                                                                <>
                                                                    <div className="mt-3">
                                                                        {post.content}
                                                                    </div>
                                                                    {renderMedia(post.media)}
                                                                    <div
                                                                        className="mt-2 text-muted"
                                                                        style={{
                                                                            fontSize: "0.9rem",
                                                                        }}
                                                                    >
                                                                        <span className="me-3">
                                                                            👍{" "}
                                                                            {post.likes?.length ||
                                                                                0}
                                                                        </span>
                                                                        <span>
                                                                            💬{" "}
                                                                            {post.comments
                                                                                ?.length || 0}
                                                                        </span>
                                                                    </div>

                                                                    {post.comments?.length > 0 && (
                                                                        <ul className="mt-3 list-unstyled">
                                                                            {post.comments.map(
                                                                                (comment) => (
                                                                                    <li
                                                                                        key={
                                                                                            comment._id
                                                                                        }
                                                                                        className="border rounded p-3 mb-2 bg-light"
                                                                                    >
                                                                                        <div className="d-flex gap-2">
                                                                                            {comment
                                                                                                .author
                                                                                                ?.avatar ? (
                                                                                                <Image
                                                                                                    src={
                                                                                                        comment
                                                                                                            .author
                                                                                                            .avatar
                                                                                                    }
                                                                                                    roundedCircle
                                                                                                    width={
                                                                                                        32
                                                                                                    }
                                                                                                    height={
                                                                                                        32
                                                                                                    }
                                                                                                    style={{
                                                                                                        objectFit:
                                                                                                            "cover",
                                                                                                        flexShrink: 0,
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <div
                                                                                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                                                                    style={{
                                                                                                        width: 32,
                                                                                                        height: 32,
                                                                                                        fontSize:
                                                                                                            "0.9rem",
                                                                                                        flexShrink: 0,
                                                                                                    }}
                                                                                                >
                                                                                                    {(
                                                                                                        comment.author?.username?.charAt(
                                                                                                            0
                                                                                                        ) ||
                                                                                                        comment.author?.email?.charAt(
                                                                                                            0
                                                                                                        ) ||
                                                                                                        "U"
                                                                                                    ).toUpperCase()}
                                                                                                </div>
                                                                                            )}
                                                                                            <div className="flex-grow-1">
                                                                                                <div className="d-flex justify-content-between align-items-start mb-1">
                                                                                                    <div>
                                                                                                        <strong className="d-block">
                                                                                                            {comment
                                                                                                                .author
                                                                                                                ?.username ||
                                                                                                                comment
                                                                                                                    .author
                                                                                                                    ?.email ||
                                                                                                                "Ẩn danh"}
                                                                                                        </strong>
                                                                                                        <span
                                                                                                            className="text-muted"
                                                                                                            style={{
                                                                                                                fontSize:
                                                                                                                    "0.75rem",
                                                                                                            }}
                                                                                                        >
                                                                                                            {new Date(
                                                                                                                comment.createdAt
                                                                                                            ).toLocaleString(
                                                                                                                "vi-VN",
                                                                                                                {
                                                                                                                    hour12: false,
                                                                                                                    year: "numeric",
                                                                                                                    month: "2-digit",
                                                                                                                    day: "2-digit",
                                                                                                                    hour: "2-digit",
                                                                                                                    minute: "2-digit",
                                                                                                                }
                                                                                                            )}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                                <div
                                                                                                    style={{
                                                                                                        fontSize:
                                                                                                            "0.9rem",
                                                                                                    }}
                                                                                                >
                                                                                                    {
                                                                                                        comment.content
                                                                                                    }
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </li>
                                                                                )
                                                                            )}
                                                                        </ul>
                                                                    )}

                                                                    <div className="mt-3 d-flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            className="form-control form-control-sm"
                                                                            placeholder="Viết bình luận..."
                                                                            value={
                                                                                commentDrafts[
                                                                                    post._id
                                                                                ] || ""
                                                                            }
                                                                            onChange={(e) =>
                                                                                setCommentDrafts(
                                                                                    (prev) => ({
                                                                                        ...prev,
                                                                                        [post._id]:
                                                                                            e.target
                                                                                                .value,
                                                                                    })
                                                                                )
                                                                            }
                                                                            onKeyDown={(e) => {
                                                                                if (
                                                                                    e.key ===
                                                                                    "Enter"
                                                                                ) {
                                                                                    e.preventDefault();
                                                                                    (async () => {
                                                                                        const content =
                                                                                            (
                                                                                                commentDrafts[
                                                                                                    post
                                                                                                        ._id
                                                                                                ] ||
                                                                                                ""
                                                                                            ).trim();
                                                                                        if (
                                                                                            !content
                                                                                        )
                                                                                            return;
                                                                                        try {
                                                                                            const {
                                                                                                data,
                                                                                            } =
                                                                                                await createComment(
                                                                                                    post._id,
                                                                                                    {
                                                                                                        content,
                                                                                                    }
                                                                                                );
                                                                                            setMyPosts(
                                                                                                (
                                                                                                    prev
                                                                                                ) =>
                                                                                                    prev.map(
                                                                                                        (
                                                                                                            p
                                                                                                        ) =>
                                                                                                            p._id ===
                                                                                                            post._id
                                                                                                                ? {
                                                                                                                      ...p,
                                                                                                                      comments:
                                                                                                                          [
                                                                                                                              ...(p.comments ||
                                                                                                                                  []),
                                                                                                                              data,
                                                                                                                          ],
                                                                                                                  }
                                                                                                                : p
                                                                                                    )
                                                                                            );
                                                                                            setCommentDrafts(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    [post._id]:
                                                                                                        "",
                                                                                                })
                                                                                            );
                                                                                        } catch (error) {
                                                                                            const errorMessage =
                                                                                                error
                                                                                                    .response
                                                                                                    ?.data
                                                                                                    ?.message ||
                                                                                                error.message ||
                                                                                                "Không thể thêm bình luận";
                                                                                            alert(
                                                                                                errorMessage
                                                                                            );
                                                                                        }
                                                                                    })();
                                                                                }
                                                                            }}
                                                                        />
                                                                        <button
                                                                            className="btn btn-sm btn-primary"
                                                                            onClick={async () => {
                                                                                const content = (
                                                                                    commentDrafts[
                                                                                        post._id
                                                                                    ] || ""
                                                                                ).trim();
                                                                                if (!content)
                                                                                    return;
                                                                                try {
                                                                                    const { data } =
                                                                                        await createComment(
                                                                                            post._id,
                                                                                            {
                                                                                                content,
                                                                                            }
                                                                                        );
                                                                                    setMyPosts(
                                                                                        (prev) =>
                                                                                            prev.map(
                                                                                                (
                                                                                                    p
                                                                                                ) =>
                                                                                                    p._id ===
                                                                                                    post._id
                                                                                                        ? {
                                                                                                              ...p,
                                                                                                              comments:
                                                                                                                  [
                                                                                                                      ...(p.comments ||
                                                                                                                          []),
                                                                                                                      data,
                                                                                                                  ],
                                                                                                          }
                                                                                                        : p
                                                                                            )
                                                                                    );
                                                                                    setCommentDrafts(
                                                                                        (prev) => ({
                                                                                            ...prev,
                                                                                            [post._id]:
                                                                                                "",
                                                                                        })
                                                                                    );
                                                                                } catch (error) {
                                                                                    const errorMessage =
                                                                                        error
                                                                                            .response
                                                                                            ?.data
                                                                                            ?.message ||
                                                                                        error.message ||
                                                                                        "Không thể thêm bình luận";
                                                                                    alert(
                                                                                        errorMessage
                                                                                    );
                                                                                }
                                                                            }}
                                                                        >
                                                                            Gửi
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {isEditingPost && (
                                                                <form
                                                                    onSubmit={handleUpdatePost}
                                                                    className="mt-3"
                                                                >
                                                                    <div className="mb-3">
                                                                        <label className="form-label">
                                                                            Nội dung
                                                                        </label>
                                                                        <textarea
                                                                            className="form-control"
                                                                            rows={3}
                                                                            value={editContent}
                                                                            onChange={(e) =>
                                                                                setEditContent(
                                                                                    e.target.value
                                                                                )
                                                                            }
                                                                        />
                                                                    </div>
                                                                    {post.media?.length
                                                                        ? renderEditMedia(post)
                                                                        : null}
                                                                    <div className="mb-3">
                                                                        <label className="form-label">
                                                                            Add image/video
                                                                        </label>
                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            accept="image/*,video/*"
                                                                            ref={editFileInputRef}
                                                                            className="form-control"
                                                                            onChange={(e) =>
                                                                                setEditFiles(
                                                                                    (prev) => [
                                                                                        ...prev,
                                                                                        ...Array.from(
                                                                                            e.target
                                                                                                .files ||
                                                                                                []
                                                                                        ),
                                                                                    ]
                                                                                )
                                                                            }
                                                                        />
                                                                        {renderNewFilesPreview(
                                                                            editFiles,
                                                                            setEditFiles
                                                                        )}
                                                                    </div>
                                                                    <div className="d-flex gap-2">
                                                                        <button
                                                                            type="submit"
                                                                            className="btn btn-primary"
                                                                        >
                                                                            Save changes
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-outline-secondary"
                                                                            onClick={resetEditForm}
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Avatar Change Modal */}
            {showAvatarModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex="-1"
                    onClick={handleCloseModal}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="modal-content shadow-lg"
                            style={{ borderRadius: "20px", border: "none" }}
                        >
                            <div
                                className="modal-header border-0 pb-0"
                                style={{ borderRadius: "20px 20px 0 0" }}
                            >
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-image me-2 text-primary"></i>
                                    Thay đổi ảnh đại diện
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleCloseModal}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                {/* Preview Section */}
                                <div className="d-flex justify-content-center mb-4">
                                    <div style={{ position: "relative" }}>
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="Preview"
                                                className="rounded-circle shadow"
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                    border: "4px solid #2196F3",
                                                }}
                                            />
                                        ) : userData.avatar ? (
                                            <img
                                                src={userData.avatar}
                                                alt="Current Avatar"
                                                className="rounded-circle shadow"
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    objectFit: "cover",
                                                    border: "4px solid #2196F3",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center shadow"
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    background:
                                                        "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
                                                    border: "4px solid #2196F3",
                                                }}
                                            >
                                                <span
                                                    className="text-white fw-bold"
                                                    style={{ fontSize: "5rem" }}
                                                >
                                                    {userData.username?.charAt(0)?.toUpperCase() ||
                                                        "U"}
                                                </span>
                                            </div>
                                        )}
                                        {uploadingAvatar && (
                                            <div
                                                className="position-absolute top-50 start-50 translate-middle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "200px",
                                                    height: "200px",
                                                    background: "rgba(0,0,0,0.5)",
                                                    borderRadius: "50%",
                                                }}
                                            >
                                                <div
                                                    className="spinner-border text-white"
                                                    role="status"
                                                    style={{ width: "3rem", height: "3rem" }}
                                                >
                                                    <span className="visually-hidden">
                                                        Loading...
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* File Input */}
                                <div className="mb-4">
                                    <label
                                        htmlFor="avatar-file-input"
                                        className="btn btn-outline-primary w-100 py-3 fw-semibold"
                                        style={{
                                            borderRadius: "12px",
                                            borderWidth: "2px",
                                            cursor: uploadingAvatar ? "not-allowed" : "pointer",
                                            transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!uploadingAvatar) {
                                                e.currentTarget.style.background = "#2196F3";
                                                e.currentTarget.style.color = "white";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!uploadingAvatar) {
                                                e.currentTarget.style.background = "transparent";
                                                e.currentTarget.style.color = "#2196F3";
                                            }
                                        }}
                                    >
                                        <i className="bi bi-folder2-open me-2"></i>
                                        {selectedFile ? "Chọn ảnh khác" : "Chọn ảnh từ máy tính"}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        disabled={uploadingAvatar}
                                        className="d-none"
                                        id="avatar-file-input"
                                    />
                                    <p className="text-muted small mt-2 mb-0 text-center">
                                        <i className="bi bi-info-circle me-1"></i>
                                        JPG, PNG, GIF - Tối đa 5MB
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-3">
                                    <button
                                        onClick={handleCloseModal}
                                        className="btn btn-outline-secondary flex-fill py-2 fw-semibold"
                                        disabled={uploadingAvatar}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleAvatarUpload}
                                        className="btn btn-primary flex-fill py-2 fw-semibold"
                                        disabled={!selectedFile || uploadingAvatar}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        {uploadingAvatar ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Save image
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showChangePasswordModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex="-1"
                    onClick={handleClosePasswordModal}
                >
                    <div
                        className="modal-dialog modal-dialog-centered modal-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="modal-content shadow-lg"
                            style={{ borderRadius: "20px", border: "none" }}
                        >
                            <div
                                className="modal-header border-0 pb-0"
                                style={{ borderRadius: "20px 20px 0 0" }}
                            >
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-key me-2 text-primary"></i>
                                    Đổi mật khẩu
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleClosePasswordModal}
                                    disabled={changingPassword}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                {/* Current Password */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold mb-2">
                                        <i className="bi bi-lock me-2 text-primary"></i>
                                        Mật khẩu hiện tại
                                    </label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        className={`form-control form-control-lg ${
                                            passwordErrors.currentPassword ? "is-invalid" : ""
                                        }`}
                                        style={{ borderRadius: "10px", borderWidth: "2px" }}
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        disabled={changingPassword}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <div className="invalid-feedback d-block">
                                            {passwordErrors.currentPassword}
                                        </div>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold mb-2">
                                        <i className="bi bi-key-fill me-2 text-primary"></i>
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className={`form-control form-control-lg ${
                                            passwordErrors.newPassword ? "is-invalid" : ""
                                        }`}
                                        style={{ borderRadius: "10px", borderWidth: "2px" }}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự, 1 chữ hoa, 1 ký tự đặc biệt)"
                                        disabled={changingPassword}
                                    />
                                    {passwordErrors.newPassword && (
                                        <div className="invalid-feedback d-block">
                                            {passwordErrors.newPassword}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold mb-2">
                                        <i className="bi bi-key-fill me-2 text-primary"></i>
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className={`form-control form-control-lg ${
                                            passwordErrors.confirmPassword ? "is-invalid" : ""
                                        }`}
                                        style={{ borderRadius: "10px", borderWidth: "2px" }}
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                        disabled={changingPassword}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <div className="invalid-feedback d-block">
                                            {passwordErrors.confirmPassword}
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex gap-3">
                                    <button
                                        onClick={handleClosePasswordModal}
                                        className="btn btn-outline-secondary flex-fill py-2 fw-semibold"
                                        disabled={changingPassword}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <i className="bi bi-x-circle me-2"></i>
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSubmitChangePassword}
                                        className="btn btn-primary flex-fill py-2 fw-semibold"
                                        disabled={changingPassword}
                                        style={{ borderRadius: "10px" }}
                                    >
                                        {changingPassword ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle me-2"></i>
                                                Đổi mật khẩu
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserProfile;
