import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Card, Image, Form, Spinner } from "react-bootstrap";
import { fetchPost, createComment, deleteComment, toggleLike } from "../../api/post.api";
import { useAuth } from "../../contexts/AuthContext";
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

function PostDetail({ postId, show = false, onHide = () => { }, asPage = false }) {
	const { user } = useAuth();
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [commentText, setCommentText] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const isOwner = useMemo(() => {
		return (postAuthorId) => user && postAuthorId && postAuthorId === user?._id;
	}, [user]);

	const loadPost = async () => {
		try {
			const { data } = await fetchPost(postId);
			setPost(data);
		} catch (error) {
			console.error("Failed to fetch post", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (postId) {
			setLoading(true);
			loadPost();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId]);

	const handleAddComment = async () => {
		if (!commentText.trim()) return;
		try {
			setSubmitting(true);
			const { data } = await createComment(postId, { content: commentText });
			setPost((prev) => prev ? { ...prev, comments: [...(prev.comments || []), data] } : prev);
			setCommentText("");
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Không thể thêm bình luận";
			alert(errorMessage);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteComment = async (commentId) => {
		try {
			await deleteComment(postId, commentId);
			setPost((prev) => prev ? { ...prev, comments: (prev.comments || []).filter(c => c._id !== commentId) } : prev);
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Không thể xóa bình luận";
			alert(errorMessage);
		}
	};

	const handleToggleLike = async () => {
		try {
			const { data } = await toggleLike(postId);
			setPost(data);
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Không thể thích bài viết";
			alert(errorMessage);
		}
	};

	const renderMedia = (media = []) => {
		if (!media.length) return null;
		return (
			<div className="mt-3 d-flex flex-column gap-2">
				{media.map((item) => (
					<div key={item.publicId}>
						{item.resourceType === "video" ? (
							<video controls style={{ width: "100%", borderRadius: "8px" }} src={item.url} />
						) : (
							<img src={item.url} alt="post-media" style={{ width: "100%", borderRadius: "8px" }} />
						)}
					</div>
				))}
			</div>
		);
	};

	const Body = (
		<Card className={asPage ? "shadow-sm" : ""}>
			{post && (
				<Card.Body>
					<div className="d-flex align-items-center mb-2 gap-2">
						{post.author?.avatar ? (
							<Image src={post.author.avatar} roundedCircle width={40} height={40} />
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

					<Card.Text className="mt-3">{post.content}</Card.Text>
					{renderMedia(post.media)}

					<div className="mt-3 d-flex align-items-center gap-3">
						<Button
							variant={post.likes?.some((like) => like._id === user?._id) ? "primary" : "outline-primary"}
							size="sm"
							onClick={handleToggleLike}
							style={{ borderRadius: "20px" }}
						>
							<span className="me-1">👍</span>
							Thích
						</Button>
						{post.likes?.length > 0 && (
							<span className="text-primary" style={{ fontSize: "0.9rem" }}>
								{post.likes.length} lượt thích
							</span>
						)}
					</div>

					<div className="mt-4">
						<Form.Control
							size="sm"
							type="text"
							placeholder="Viết bình luận..."
							value={commentText}
							onChange={(e) => setCommentText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									if (!submitting) handleAddComment();
								}
							}}
						/>
						{post.comments?.length > 0 && (
							<ul className="mt-3 list-unstyled">
								{post.comments.map((comment) => (
									<li key={comment._id} className="border rounded p-3 mb-2 bg-light">
										<div className="d-flex gap-2">
											{comment.author?.avatar ? (
												<Image
													src={comment.author.avatar}
													roundedCircle
													width={32}
													height={32}
													style={{ objectFit: "cover", flexShrink: 0 }}
												/>
											) : (
												<div
													className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
													style={{ width: 32, height: 32, fontSize: "0.9rem", flexShrink: 0 }}
												>
													{(comment.author?.username?.charAt(0) ||
														comment.author?.email?.charAt(0) ||
														"U"
													).toUpperCase()}
												</div>
											)}
											<div className="flex-grow-1">
												<div className="d-flex justify-content-between align-items-start mb-1">
													<div>
														<strong className="d-block">
															{comment.author?.username || comment.author?.email || "Ẩn danh"}
														</strong>
														<span className="text-muted" style={{ fontSize: "0.75rem" }}>
															{formatDateTime(comment.createdAt)}
														</span>
													</div>
													{(comment.author?._id === user?._id || isOwner(post.author?._id)) && (
														<Button
															size="sm"
															variant="link"
															className="text-danger p-0"
															style={{ fontSize: "0.85rem" }}
															onClick={() => handleDeleteComment(comment._id)}
														>
															Xóa
														</Button>
													)}
												</div>
												<div style={{ fontSize: "0.9rem" }}>{comment.content}</div>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</Card.Body>
			)}
			{loading && (
				<div className="d-flex justify-content-center py-5">
					<Spinner animation="border" role="status">
						<span className="visually-hidden">Loading...</span>
					</Spinner>
				</div>
			)}
		</Card>
	);

	if (asPage) {
		return (
			<div className="container my-4" style={{ maxWidth: 720 }}>
				{Body}
			</div>
		);
	}

	return (
		<Modal show={show} onHide={onHide} centered size="lg">
			<Modal.Header closeButton>
				<Modal.Title>Chi tiết bài viết</Modal.Title>
			</Modal.Header>
			<Modal.Body>{Body}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onHide}>
					Đóng
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default PostDetail;


