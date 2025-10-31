import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function RegisterScreen() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [major, setMajor] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { sendOTP } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Validate
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Send OTP first
        const result = await sendOTP(email);

        if (result.success) {
            // Save form data to localStorage to use after OTP verification
            const formData = { username, email, password, role: "student", major };
            localStorage.setItem("registerFormData", JSON.stringify(formData));
            localStorage.setItem("registrationEmail", email);
            localStorage.setItem("otpToken", result.otpToken);

            // Navigate to OTP page
            navigate("/otp");
        } else {
            setError(result.message || "Failed to send OTP");
        }

        setLoading(false);
    };

    return (
        <div className="container my-5">
            <div className="card">
                <div className="row g-0">
                    <div className="col-md-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                            alt="register form"
                            className="img-fluid rounded-start w-100"
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="d-flex flex-row mt-2 align-items-center">
                                <i
                                    className="fas fa-user-plus fa-3x me-3"
                                    style={{ color: "#ff6219" }}
                                ></i>
                                <span className="h1 fw-bold mb-0">Register</span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Create a new account
                            </h5>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="username">Full Name</label>
                                    <input
                                        type="text"
                                        id="username"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your full name"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>

                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="email">Email</label>
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

                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="form-control form-control-lg"
                                        placeholder="Re-enter your password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="major">Major</label>
                                    <input
                                        type="text"
                                        id="major"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your major"
                                        value={major}
                                        onChange={(e) => setMajor(e.target.value)}
                                    />
                                </div>

                                <button
                                    className="btn btn-dark btn-lg btn-block mb-4 px-5 w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Sending OTP..." : "Register"}
                                </button>

                                <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                                    Already have an account?{" "}
                                    <Link to="/login" style={{ color: "#393f81" }}>
                                        Login here
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
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterScreen;
