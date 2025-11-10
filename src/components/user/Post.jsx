import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Form, Image, Spinner, Modal } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import {
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    createComment,
    deleteComment,
    toggleLike,
} from "../../api/post.api";

const formatDateTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("vi-VN", {
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function Post() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newContent, setNewContent] = useState("");
    const [newFiles, setNewFiles] = useState([]);
    const [commentDrafts, setCommentDrafts] = useState({});
    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editFiles, setEditFiles] = useState([]);
    const [editKeepMedia, setEditKeepMedia] = useState([]);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [selectedPostLikes, setSelectedPostLikes] = useState([]);
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const { data } = await fetchPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

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
            setPosts((prev) => [data, ...prev]);
            resetCreateForm();
        } catch (error) {
            console.error("Failed to create post", error);
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
            setPosts((prev) => prev.map((p) => (p._id === data._id ? data : p)));
            resetEditForm();
        } catch (error) {
            console.error("Failed to update post", error);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) return;
        try {
            await deletePost(postId);
            setPosts((prev) => prev.filter((p) => p._id !== postId));
        } catch (error) {
            console.error("Failed to delete post", error);
        }
    };

    const handleAddComment = async (postId) => {
        const content = commentDrafts[postId];
        if (!content || !content.trim()) return;
        try {
            const { data } = await createComment(postId, { content });
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? { ...post, comments: [...post.comments, data] }
                        : post
                )
            );
            setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Failed to create comment", error);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            await deleteComment(postId, commentId);
            setPosts((prev) =>
                prev.map((post) =>
                    post._id === postId
                        ? {
                              ...post,
                              comments: post.comments.filter(
                                  (c) => c._id !== commentId
                              ),
                          }
                        : post
                )
            );
        } catch (error) {
            console.error("Failed to delete comment", error);
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            const { data } = await toggleLike(postId);
            setPosts((prev) =>
                prev.map((post) => (post._id === postId ? data : post))
            );
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const handleShowLikes = (post) => {
        setSelectedPostLikes(post.likes || []);
        setShowLikesModal(true);
    };

    const isOwner = useMemo(() => {
        return (postAuthorId) =>
            user && postAuthorId && postAuthorId === user?._id;
    }, [user]);

    const renderMedia = (media = []) => {
        if (!media.length) return null;
        return (
            <div className="mt-3 d-flex flex-column gap-2">
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
                                <Form.Check
                                    type="checkbox"
                                    id={`${post._id}-${item.publicId}`}
                                    className="mb-2"
                                    label="Giữ lại"
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
                                {item.resourceType === "video" ? (
                                    <video
                                        src={item.url}
                                        style={{
                                            width: "100%",
                                            borderRadius: "6px",
                                        }}
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
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                    setFiles((prev) =>
                                        prev.filter((_, index) => index !== idx)
                                    )
                                }
                            >
                                Xóa
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div>
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleCreatePost}>
                        <Form.Group className="mb-3" controlId="postContent">
                            <Form.Label className="fw-semibold">
                                Đăng bài viết
                            </Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Bạn đang nghĩ gì?"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh hoặc video</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={(e) =>
                                    setNewFiles(Array.from(e.target.files || []))
                                }
                            />
                            {renderNewFilesPreview(newFiles, setNewFiles)}
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button type="submit" disabled={creating}>
                                {creating ? "Đang đăng..." : "Đăng bài"}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {posts.map((post) => {
                const owner = isOwner(post.author?._id);
                const isEditing = editingPostId === post._id;
                return (
                    <Card key={post._id} className="mb-4 shadow-sm">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div className="d-flex align-items-center mb-2 gap-2">
                                    {post.author?.avatar ? (
                                        <Image
                                            src={post.author.avatar}
                                            roundedCircle
                                            width={40}
                                            height={40}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                            style={{ width: 40, height: 40 }}
                                        >
                                            {post.author?.username?.charAt(0)?.toUpperCase() ||
                                                post.author?.email?.charAt(0)?.toUpperCase() ||
                                                "U"}
                                        </div>
                                    )}
                                    <div>
                                        <strong>{post.author?.username || post.author?.email}</strong>
                                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                            {formatDateTime(post.createdAt)}
                                        </div>
                                    </div>
                                </div>
                                {owner && !isEditing && (
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={() => startEditing(post)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleDeletePost(post._id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {!isEditing && (
                                <>
                                    <Card.Text className="mt-3">{post.content}</Card.Text>
                                    {renderMedia(post.media)}
                                    
                                    {/* Like Button and Count */}
                                    <div className="mt-3 d-flex align-items-center gap-3">
                                        <Button
                                            variant={post.likes?.some(like => like._id === user?._id) ? "primary" : "outline-primary"}
                                            size="sm"
                                            onClick={() => handleToggleLike(post._id)}
                                            style={{ borderRadius: "20px" }}
                                        >
                                            <span className="me-1">👍</span>
                                            Thích
                                        </Button>
                                        {post.likes?.length > 0 && (
                                            <span
                                                className="text-primary"
                                                style={{
                                                    cursor: "pointer",
                                                    fontSize: "0.9rem",
                                                    textDecoration: "underline",
                                                }}
                                                onClick={() => handleShowLikes(post)}
                                            >
                                                {post.likes.length} lượt thích
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {isEditing && (
                                <Form onSubmit={handleUpdatePost} className="mt-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nội dung</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                        />
                                    </Form.Group>
                                    {post.media?.length ? renderEditMedia(post) : null}
                                    <Form.Group className="mb-3">
                                        <Form.Label>Thêm ảnh/video</Form.Label>
                                        <Form.Control
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            ref={editFileInputRef}
                                            onChange={(e) =>
                                                setEditFiles((prev) => [
                                                    ...prev,
                                                    ...Array.from(e.target.files || []),
                                                ])
                                            }
                                        />
                                        {renderNewFilesPreview(editFiles, setEditFiles)}
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button type="submit" variant="primary">
                                            Lưu thay đổi
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline-secondary"
                                            onClick={resetEditForm}
                                        >
                                            Hủy
                                        </Button>
                                    </div>
                                </Form>
                            )}

                            <div className="mt-4">
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Viết bình luận..."
                                    value={commentDrafts[post._id] || ""}
                                    onChange={(e) =>
                                        setCommentDrafts((prev) => ({
                                            ...prev,
                                            [post._id]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddComment(post._id);
                                        }
                                    }}
                                />
                                {post.comments?.length > 0 && (
                                    <ul className="mt-3 list-unstyled">
                                        {post.comments.map((comment) => (
                                            <li
                                                key={comment._id}
                                                className="border rounded p-3 mb-2 bg-light"
                                            >
                                                <div className="d-flex gap-2">
                                                    {/* Avatar */}
                                                    {comment.author?.avatar ? (
                                                        <Image
                                                            src={comment.author.avatar}
                                                            roundedCircle
                                                            width={32}
                                                            height={32}
                                                            style={{
                                                                objectFit: "cover",
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: 32,
                                                                height: 32,
                                                                fontSize: "0.9rem",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {(comment.author?.username?.charAt(0) ||
                                                                comment.author?.email?.charAt(0) ||
                                                                "U").toUpperCase()}
                                                        </div>
                                                    )}
                                                    {/* Comment Content */}
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                                            <div>
                                                                <strong className="d-block">
                                                                    {comment.author?.username ||
                                                                        comment.author?.email ||
                                                                        "Ẩn danh"}
                                                                </strong>
                                                                <span
                                                                    className="text-muted"
                                                                    style={{ fontSize: "0.75rem" }}
                                                                >
                                                                    {formatDateTime(comment.createdAt)}
                                                                </span>
                                                            </div>
                                                            {(comment.author?._id === user?._id ||
                                                                owner) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="link"
                                                                    className="text-danger p-0"
                                                                    style={{ fontSize: "0.85rem" }}
                                                                    onClick={() =>
                                                                        handleDeleteComment(
                                                                            post._id,
                                                                            comment._id
                                                                        )
                                                                    }
                                                                >
                                                                    Xóa
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: "0.9rem" }}>
                                                            {comment.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}

            {/* Likes Modal */}
            <Modal
                show={showLikesModal}
                onHide={() => setShowLikesModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2">👍</span>
                        Người đã thích
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {selectedPostLikes.length === 0 ? (
                        <p className="text-muted text-center">Chưa có ai thích bài viết này</p>
                    ) : (
                        <div className="list-unstyled mb-0">
                            {selectedPostLikes.map((likeUser) => (
                                <div
                                    key={likeUser._id}
                                    className="d-flex align-items-center gap-3 p-2 mb-2 rounded"
                                    style={{
                                        backgroundColor: "#f8f9fa",
                                        transition: "background-color 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#e9ecef";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                                    }}
                                >
                                    {likeUser.avatar ? (
                                        <Image
                                            src={likeUser.avatar}
                                            roundedCircle
                                            width={40}
                                            height={40}
                                            style={{ objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div
                                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                            style={{ width: 40, height: 40 }}
                                        >
                                            {(likeUser.username?.charAt(0) ||
                                                likeUser.email?.charAt(0) ||
                                                "U").toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <strong>
                                            {likeUser.username || likeUser.email || "Ẩn danh"}
                                        </strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowLikesModal(false)}
                    >
                        Đóng
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Post;
