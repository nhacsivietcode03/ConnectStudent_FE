import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function LoginScreen() {
    useEffect(() => {
        document.title = "Login - ConnectStudent";
    }, []);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate("/");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate("/");
        } else {
            setError(result.message || "Login failed");
        }

        setLoading(false);
    };

    return (
        <div className="container my-5">
            <div className="card">
                <div className="row g-0">
                    <div className="col-md-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                            alt="login form"
                            className="img-fluid rounded-start w-100"
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="d-flex flex-row mt-2 align-items-center">
                                <i
                                    className="fas fa-cubes fa-3x me-3"
                                    style={{ color: "#2196F3" }}
                                ></i>
                                <span className="h1 fw-bold mb-0" style={{ color: "#2196F3" }}>
                                    ConnectStudent
                                </span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Login to your account
                            </h5>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="email">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="password">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    className="btn btn-primary btn-lg btn-block mb-4 px-5 w-100"
                                    type="submit"
                                    disabled={loading}
                                    style={{ backgroundColor: "#2196F3", borderColor: "#2196F3" }}
                                >
                                    {loading ? "Login loading..." : "Login"}
                                </button>
                            </form>

                            <Link to="/forgot-password" className="small text-muted d-block">
                                Forgot password?
                            </Link>
                            <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                                Don't have an account?{" "}
                                <Link to="/register" style={{ color: "#393f81" }}>
                                    Register here
                                </Link>
                            </p>

                            <div className="d-flex flex-row justify-content-start">
                                <a href="#!" className="small text-muted me-1">
                                    Terms of use.
                                </a>
                                <a href="#!" className="small text-muted">
                                    Privacy policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginScreen;
