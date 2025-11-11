import React, { useEffect, useState } from "react";
import Header from "../reuse/header";
import { Container, Card, Image, Button } from "react-bootstrap";
import { getFollowers, getFollowing, removeFollower, sendFollowRequest, unfollow } from "../../api/follow.api";

function FriendsPage() {
    const [following, setFollowing] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [requested, setRequested] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [fo, fr] = await Promise.all([getFollowing(), getFollowers()]);
                setFollowing(fo.data || []);
                setFollowers(fr.data || []);
            } catch (e) {
                console.error("Failed to load friends", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const followingIdSet = new Set((following || []).map((f) => String(f.receiver?._id)));

    const handleUnfollow = async (userId) => {
        try {
            const ok = window.confirm("Are you sure you want to unfollow this user?");
            if (!ok) return;
            await unfollow(userId);
            setFollowing((prev) => prev.filter((f) => f.receiver?._id !== userId));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot unfollow";
            alert(errorMessage);
        }
    };

    const handleFollowBack = async (userId) => {
        try {
            await sendFollowRequest(userId);
            setRequested((prev) => ({ ...prev, [userId]: true }));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot send follow request";
            alert(errorMessage);
        }
    };

    const handleRemoveFollower = async (userId) => {
        try {
            const ok = window.confirm("Are you sure you want to remove this user from your followers?");
            if (!ok) return;
            await removeFollower(userId);
            setFollowers((prev) => prev.filter((f) => f.sender?._id !== userId));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot remove follower";
            alert(errorMessage);
        }
    };

    const renderUserRow = (user, right = null, key) => (
        <div key={key} className="d-flex align-items-center justify-content-between p-2 border rounded mb-2">
            <div className="d-flex align-items-center gap-2">
                {user.avatar ? (
                    <Image src={user.avatar} roundedCircle width={40} height={40} style={{ objectFit: "cover" }} />
                ) : (
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                        {(user.username?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}
                    </div>
                )}
                <div>
                    <strong>{user.username || user.email}</strong>
                </div>
            </div>
            {right}
        </div>
    );

    return (
        <div>
            <Header />
            <Container className="my-4" style={{ maxWidth: "900px" }}>
                <Card className="mb-4 shadow-sm">
                    <Card.Body>
                        <h5 className="mb-3">Following</h5>
                        {loading ? (
                            <div className="text-muted">Loading...</div>
                        ) : following.length === 0 ? (
                            <div className="text-muted">You are not following anyone.</div>
                        ) : (
                            following.map((f) =>
                                renderUserRow(
                                    f.receiver || {},
                                    <Button size="sm" variant="outline-danger" onClick={() => handleUnfollow(f.receiver?._id)}>
                                        Unfollow
                                    </Button>,
                                    f._id
                                )
                            )
                        )}
                    </Card.Body>
                </Card>

                <Card className="shadow-sm">
                    <Card.Body>
                        <h5 className="mb-3">Followers</h5>
                        {loading ? (
                            <div className="text-muted">Loading...</div>
                        ) : followers.length === 0 ? (
                            <div className="text-muted">No one is following you yet.</div>
                        ) : (
                            followers.map((f) => {
                                const u = f.sender || {};
                                const isFollowingBack = followingIdSet.has(String(u._id));
                                return renderUserRow(
                                    u,
                                    <div className="d-flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            disabled={isFollowingBack || requested[u._id]}
                                            onClick={() => handleFollowBack(u._id)}
                                        >
                                            {isFollowingBack ? "Following" : requested[u._id] ? "Sent" : "Follow back"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemoveFollower(u._id)}
                                        >
                                            Remove follower
                                        </Button>
                                    </div>,
                                    f._id
                                );
                            })
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default FriendsPage;


