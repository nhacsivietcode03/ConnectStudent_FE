import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-primary text-white shadow">
            <h1 className="fs-3 fw-bold mb-0">UniConnect</h1>

            <nav className="d-flex gap-4">
                <Link to="/" className="text-white text-decoration-none">
                    Home
                </Link>
                <button
                    className="btn btn-link text-white text-decoration-none p-0 border-0"
                    style={{ textDecoration: "none" }}
                >
                    About
                </button>
                <button
                    className="btn btn-link text-white text-decoration-none p-0 border-0"
                    style={{ textDecoration: "none" }}
                >
                    Contact
                </button>
            </nav>

            {isAuthenticated && user ? (
                <div className="d-flex align-items-center gap-3">
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
                                {(user.username || user.email || "U").charAt(0).toUpperCase()}
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
