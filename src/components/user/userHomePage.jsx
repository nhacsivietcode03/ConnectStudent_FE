
import Header from "../reuse/header";
import {
    Container,
    Card,
    Button,
    Image
} from "react-bootstrap";
import Post from "./Post";
import React, { useEffect, useState } from "react";
import { acceptFollowRequest, getIncomingRequests, rejectFollowRequest } from "../../api/follow.api";
import { useSocket } from "../../contexts/SocketContext";

function UserHomePage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected } = useSocket();

    const loadRequests = async () => {
        try {
            setLoading(true);
            const { data } = await getIncomingRequests();
            setRequests(data || []);
        } catch (e) {
            console.error("Failed to load follow requests", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;
        const handler = (notification) => {
            if (notification?.type === "follow_request") {
                loadRequests();
            }
        };
        socket.on("new-notification", handler);
        return () => {
            socket.off("new-notification", handler);
        };
    }, [socket, isConnected]);

    const handleAccept = async (id) => {
        try {
            await acceptFollowRequest(id);
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot accept request";
            alert(errorMessage);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectFollowRequest(id);
            setRequests((prev) => prev.filter((r) => r._id !== id));
        } catch (e) {
            const errorMessage = e.response?.data?.message || "Cannot reject request";
            alert(errorMessage);
        }
    };

    return (
        <div>
            <Header />
            <Container className="my-4" style={{ maxWidth: "800px" }}>
                <Post />
            </Container>

            {!loading && requests.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: 90,
                        right: 24,
                        width: 320,
                        zIndex: 1040
                    }}
                >
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="mb-3">Lời mời theo dõi</h5>
                            <div className="d-flex flex-column gap-2">
                                {requests.map((req) => (
                                    <div key={req._id} className="d-flex align-items-center justify-content-between border rounded p-2">
                                        <div className="d-flex align-items-center gap-2">
                                            {req.sender?.avatar ? (
                                                <Image src={req.sender.avatar} roundedCircle width={36} height={36} style={{ objectFit: "cover" }} />
                                            ) : (
                                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                                                    {(req.sender?.username?.charAt(0) || req.sender?.email?.charAt(0) || "U").toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <strong>{req.sender?.username || req.sender?.email}</strong>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <Button size="sm" variant="primary" onClick={() => handleAccept(req._id)}>Accept</Button>
                                            <Button size="sm" variant="outline-secondary" onClick={() => handleReject(req._id)}>Reject</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default UserHomePage;
