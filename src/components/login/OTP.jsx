import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function OTP() {
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();
    const { register } = useAuth();

    useEffect(() => {
        document.title = "Verify OTP - ConnectStudent";

        // Get email and otpToken from localStorage
        const savedEmail = localStorage.getItem("registrationEmail");
        const savedToken = localStorage.getItem("otpToken");

        if (!savedEmail || !savedToken) {
            // If no email or token, go back to register page
            navigate("/register");
            return;
        }

        setEmail(savedEmail);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (otpCode.length !== 6) {
            setError("OTP code must be 6 digits");
            setLoading(false);
            return;
        }

        // Get form data from localStorage
        const formData = JSON.parse(localStorage.getItem("registerFormData") || "{}");
        const otpToken = localStorage.getItem("otpToken");

        if (!formData.email || !otpToken) {
            setError("Registration data not found. Please start over.");
            setLoading(false);
            return;
        }

        // Call register API with OTP
        const result = await register({
            ...formData,
            otpCode: otpCode,
            otpToken: otpToken,
        });

        if (result.success) {
            setSuccess(result.message || "Registration successful!");
            // Clear temporary data
            localStorage.removeItem("registerFormData");
            localStorage.removeItem("registrationEmail");
            localStorage.removeItem("otpCode");
            localStorage.removeItem("otpToken");

            // Navigate to login page after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } else {
            setError(result.message || "Registration failed");
            if (result.errors) {
                setError(result.errors.join(", "));
            }
        }

        setLoading(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
        if (value.length <= 6) {
            setOtpCode(value);
            setError("");
        }
    };

    return (
        <div className="container my-5">
            <div className="card shadow-lg border-0">
                <div className="row g-0">
                    <div className="col-md-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                            alt="login form"
                            className="img-fluid rounded-start w-100 h-100"
                            style={{ objectFit: "cover" }}
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center px-5 py-4">
                        <form className="w-100" onSubmit={handleSubmit}>
                            <div className="text-center mb-4">
                                <i
                                    className="fas fa-shield-alt fa-3x mb-3"
                                    style={{ color: "#2196F3" }}
                                ></i>
                                <h5 className="fw-normal pb-3" style={{ letterSpacing: "1px" }}>
                                    Enter Verification Code
                                </h5>
                                {email && (
                                    <p className="text-muted small">
                                        OTP has been sent to: <strong>{email}</strong>
                                    </p>
                                )}
                            </div>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="otp-input">
                                    Verification Code (6 digits)
                                </label>
                                <input
                                    type="text"
                                    id="otp-input"
                                    className="form-control form-control-lg text-center"
                                    placeholder="Enter 6-digit code"
                                    value={otpCode}
                                    onChange={handleInputChange}
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    style={{
                                        fontSize: "24px",
                                        letterSpacing: "8px",
                                        fontWeight: "bold",
                                    }}
                                />
                            </div>

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    className="btn btn-primary btn-lg px-5 mb-3 w-100"
                                    type="submit"
                                    disabled={otpCode.length !== 6 || loading}
                                >
                                    {loading ? "Processing..." : "Verify"}
                                </button>

                                <Link
                                    to="/register"
                                    className="small text-muted d-block mt-2"
                                    style={{ pointerEvents: loading ? "none" : "auto" }}
                                >
                                    Back to register
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OTP;
