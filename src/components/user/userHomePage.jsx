import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../reuse/header";
import { useAuth } from "../../contexts/AuthContext";

function UserHomePage() {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <div
            className="min-vh-100"
            style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}
        >
            <Header />
            <main className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* Welcome Section */}
                        <div
                            className="card shadow-lg mb-4"
                            style={{ borderRadius: "20px", border: "none", overflow: "hidden" }}
                        >
                            <div
                                style={{
                                    background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
                                    padding: "3rem 2rem",
                                }}
                            >
                                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
                                    <div className="d-flex align-items-center gap-4">
                                        <div
                                            className="rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                                background: "white",
                                                border: "5px solid white",
                                                overflow: "hidden",
                                                cursor: "pointer",
                                                transition: "transform 0.3s ease",
                                            }}
                                            onClick={() => navigate("/profile")}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = "scale(1.1)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = "scale(1)";
                                            }}
                                        >
                                            {user?.avatar ? (
                                                <img
                                                    src={user.avatar}
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
                                                    style={{ fontSize: "2.5rem" }}
                                                >
                                                    {(user?.username || user?.email || "U")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-white text-center text-md-start">
                                            <h2
                                                className="mb-2 fw-bold"
                                                style={{ fontSize: "2rem" }}
                                            >
                                                Chào mừng trở lại!
                                            </h2>
                                            <p
                                                className="mb-0"
                                                style={{ opacity: 0.9, fontSize: "1.2rem" }}
                                            >
                                                <strong>
                                                    {user?.username || user?.email || "Người dùng"}
                                                </strong>
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="btn btn-light fw-semibold px-4 py-2"
                                        style={{
                                            borderRadius: "12px",
                                            border: "none",
                                            fontSize: "1rem",
                                            transition: "all 0.3s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "#f8f9fa";
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 4px 8px rgba(0,0,0,0.2)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "white";
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        <i className="bi bi-person-circle me-2"></i>
                                        Xem hồ sơ
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions or Content */}
                        <div
                            className="card shadow-lg"
                            style={{ borderRadius: "20px", border: "none" }}
                        >
                            <div className="card-body p-4 p-md-5">
                                <h4 className="mb-4 fw-bold text-primary">
                                    <i className="bi bi-house-door me-2"></i>
                                    Trang chủ
                                </h4>
                                <p className="text-muted">
                                    Chào mừng bạn đến với ConnectStudent! Đây là trang chủ của bạn.
                                </p>
                                <div className="d-flex gap-3 mt-4">
                                    <button
                                        onClick={() => navigate("/profile")}
                                        className="btn btn-primary px-4 py-2 fw-semibold"
                                        style={{ borderRadius: "10px" }}
                                    >
                                        <i className="bi bi-person-gear me-2"></i>
                                        Quản lý hồ sơ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default UserHomePage;
