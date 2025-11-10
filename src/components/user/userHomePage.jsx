import React, { useState } from "react";
import Header from "../reuse/header";
import {
    Button,
    Card,
    Container,
    Form,
    InputGroup,
    Image,
} from "react-bootstrap";

function UserHomePage() {
    // Sample user posts (replace with API data later)
    const [posts, setPosts] = useState([
        {
            id: 1,
            user: { name: "Anna Nguyen", avatar: "https://i.pravatar.cc/50?img=1" },
            content: "Just finished my final project! 🎉",
            image: "https://picsum.photos/600/300?random=1",
            likes: 4,
            comments: ["Congrats!", "So proud of you!"],
            shares: 2,
            time: "2h ago",
        },
        {
            id: 2,
            user: { name: "John Tran", avatar: "https://i.pravatar.cc/50?img=3" },
            content: "Coffee time ☕ Anyone joining?",
            image: "",
            likes: 10,
            comments: ["Let's go!", "Too far 😅"],
            shares: 1,
            time: "4h ago",
        },
    ]);

    const [commentInput, setCommentInput] = useState({});

    // Like button
    const handleLike = (id) => {
        setPosts(
            posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
        );
    };

    // Comment button
    const handleComment = (id) => {
        if (!commentInput[id]?.trim()) return;
        setPosts(
            posts.map((p) =>
                p.id === id
                    ? { ...p, comments: [...p.comments, commentInput[id]] }
                    : p
            )
        );
        setCommentInput({ ...commentInput, [id]: "" });
    };

    // Share button
    const handleShare = (id) => {
        setPosts(
            posts.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p))
        );
        alert("Post shared successfully!");
    };

    return (
        <div>
            <Header />

            <Container className="my-4" style={{ maxWidth: "800px" }}>
 
                {posts.map((post) => (
                    <Card key={post.id} className="mb-4 shadow-sm">
                        <Card.Body>
                            {/* User Info */}
                            <div className="d-flex align-items-center mb-2">
                                <Image
                                    src={post.user.avatar}
                                    roundedCircle
                                    width={40}
                                    height={40}
                                    className="me-2"
                                />
                                <div>
                                    <strong>{post.user.name}</strong>
                                    <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                                        {post.time}
                                    </div>
                                </div>
                            </div>

                            {/* Post Content */}
                            <Card.Text className="mt-2">{post.content}</Card.Text>
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="post"
                                    className="rounded w-100 my-2"
                                />
                            )}

                            {/* Interaction Buttons */}
                            <div className="d-flex gap-3 mt-3">
                                <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleLike(post.id)}
                                >
                                    👍 {post.likes}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    onClick={() => handleShare(post.id)}
                                >
                                    🔁 {post.shares}
                                </Button>
                            </div>

                            {/* Comments */}
                            <div className="mt-3">
                                <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentInput[post.id] || ""}
                                    onChange={(e) =>
                                        setCommentInput({
                                            ...commentInput,
                                            [post.id]: e.target.value,
                                        })
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleComment(post.id);
                                        }
                                    }}
                                />
                                {post.comments.length > 0 && (
                                    <ul className="mt-2 list-unstyled">
                                        {post.comments.map((c, i) => (
                                            <li
                                                key={i}
                                                className="border p-2 rounded mb-1 bg-light"
                                                style={{ fontSize: "0.9rem" }}
                                            >
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </Container>
        </div>
    );
}

export default UserHomePage;
