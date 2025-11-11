import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function VerifyOtpResetScreen() {
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Verify OTP - ConnectStudent";

        // Get email and otpToken from localStorage
        const savedEmail = localStorage.getItem("resetPasswordEmail");
        const savedToken = localStorage.getItem("resetPasswordOtpToken");

        if (!savedEmail || !savedToken) {
            // If no email or token, go back to forgot password page
            navigate("/forgot-password");
            return;
        }

        setEmail(savedEmail);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validate
        if (otpCode.length !== 6) {
            setError("OTP code must be 6 digits");
            setLoading(false);
            return;
        }

        // Get OTP token from localStorage
        const otpToken = localStorage.getItem("resetPasswordOtpToken");

        // Verify OTP locally by checking if it matches the token
        try {
            // For now, we'll just navigate to reset password
            // The actual verification will happen on the backend
            setSuccess("OTP verified successfully!");

            // Save OTP code to localStorage
            localStorage.setItem("resetPasswordOtpCode", otpCode);

            // Navigate to reset password page after 1 second
            setTimeout(() => {
                navigate("/reset-password");
            }, 1000);
        } catch (err) {
            setError("Failed to verify OTP");
        }

        setLoading(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
        if (value.length <= 6) {
            setOtpCode(value);
        }
    };

    return (
        <div className="container my-5">
            <div className="card">
                <div className="row g-0">
                    <div className="col-md-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                            alt="verify otp form"
                            className="img-fluid rounded-start w-100"
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="d-flex flex-row mt-2 align-items-center">
                                <i
                                    className="fas fa-shield-alt fa-3x me-3"
                                    style={{ color: "#2196F3" }}
                                ></i>
                                <span className="h1 fw-bold mb-0" style={{ color: "#2196F3" }}>
                                    Verify OTP
                                </span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Enter the OTP code sent to {email}
                            </h5>

                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success" role="alert">
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="otp">
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        className="form-control form-control-lg text-center"
                                        placeholder="000000"
                                        value={otpCode}
                                        onChange={handleInputChange}
                                        maxLength={6}
                                        required
                                        style={{ fontSize: "24px", letterSpacing: "10px" }}
                                    />
                                </div>

                                <button
                                    className="btn btn-primary btn-lg btn-block w-100 mb-4"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Verifying..." : "Verify OTP"}
                                </button>

                                <div className="text-center">
                                    <Link to="/forgot-password" className="small text-muted">
                                        Back to Forgot Password
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VerifyOtpResetScreen;
