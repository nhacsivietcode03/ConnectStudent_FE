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
            const ok = window.confirm("Bạn có chắc muốn hủy theo dõi người này?");
            if (!ok) return;
            await unfollow(userId);
            setFollowing((prev) => prev.filter((f) => f.receiver?._id !== userId));
        } catch (e) {
            console.error("Failed to unfollow", e);
        }
    };

    const handleFollowBack = async (userId) => {
        try {
            await sendFollowRequest(userId);
            setRequested((prev) => ({ ...prev, [userId]: true }));
        } catch (e) {
            // noop
        }
    };

    const handleRemoveFollower = async (userId) => {
        try {
            const ok = window.confirm("Bạn có chắc muốn xóa người này khỏi danh sách theo dõi bạn?");
            if (!ok) return;
            await removeFollower(userId);
            setFollowers((prev) => prev.filter((f) => f.sender?._id !== userId));
        } catch (e) {
            console.error("Failed to remove follower", e);
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
                        <h5 className="mb-3">Đang theo dõi</h5>
                        {loading ? (
                            <div className="text-muted">Đang tải...</div>
                        ) : following.length === 0 ? (
                            <div className="text-muted">Bạn chưa theo dõi ai.</div>
                        ) : (
                            following.map((f) =>
                                renderUserRow(
                                    f.receiver || {},
                                    <Button size="sm" variant="outline-danger" onClick={() => handleUnfollow(f.receiver?._id)}>
                                        Hủy theo dõi
                                    </Button>,
                                    f._id
                                )
                            )
                        )}
                    </Card.Body>
                </Card>

                <Card className="shadow-sm">
                    <Card.Body>
                        <h5 className="mb-3">Người theo dõi bạn</h5>
                        {loading ? (
                            <div className="text-muted">Đang tải...</div>
                        ) : followers.length === 0 ? (
                            <div className="text-muted">Chưa có ai theo dõi bạn.</div>
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
                                            {isFollowingBack ? "Đang theo dõi" : requested[u._id] ? "Đã gửi" : "Theo dõi lại"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            onClick={() => handleRemoveFollower(u._id)}
                                        >
                                            Xóa người theo dõi
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


