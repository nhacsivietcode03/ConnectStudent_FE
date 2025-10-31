import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-primary text-white shadow">
            <h1 className="fs-3 fw-bold mb-0">UniConnect</h1>

            <nav className="d-flex gap-4">
                <Link to="/" className="text-white text-decoration-none">Home</Link>
                <a href="#" className="text-white text-decoration-none">About</a>
                <a href="#" className="text-white text-decoration-none">Contact</a>
            </nav>

            {isAuthenticated && user ? (
                <div className="d-flex align-items-center gap-3">
                    <span className="text-white">
                        Welcome, <strong>{user.username || user.email}</strong>
                    </span>
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
