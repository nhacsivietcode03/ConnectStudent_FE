import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="d-flex align-items-center justify-content-between px-4 py-3 bg-primary text-white shadow">

            <h1 className="fs-3 fw-bold mb-0">UniConnect</h1>

            <nav className="d-flex gap-4">
                <a href="#" className="text-white text-decoration-none">Home</a>
                <a href="#" className="text-white text-decoration-none">About</a>
                <a href="#" className="text-white text-decoration-none">Contact</a>
            </nav>


            <Link to="/login" className="btn btn-light text-primary fw-semibold">
                Login
            </Link>
        </header>
    );
}

export default Header;
