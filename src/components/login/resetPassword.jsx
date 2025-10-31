import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ResetPasswordScreen() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Get email, otpToken and otpCode from localStorage
        const savedEmail = localStorage.getItem("resetPasswordEmail");
        const savedToken = localStorage.getItem("resetPasswordOtpToken");
        const savedOtpCode = localStorage.getItem("resetPasswordOtpCode");

        if (!savedEmail || !savedToken || !savedOtpCode) {
            // If no email, token or OTP code, go back to verify OTP page
            navigate("/verify-otp-reset");
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
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        // Get otpToken and otpCode from localStorage
        const otpToken = localStorage.getItem("resetPasswordOtpToken");
        const otpCode = localStorage.getItem("resetPasswordOtpCode");

        if (!otpToken || !otpCode) {
            setError("OTP verification data not found. Please verify OTP again.");
            setLoading(false);
            return;
        }

        // Call reset password API
        const result = await resetPassword(email, otpCode, otpToken, newPassword);

        if (result.success) {
            setSuccess(result.message || "Password reset successful!");
            // Clear temporary data
            localStorage.removeItem("resetPasswordEmail");
            localStorage.removeItem("resetPasswordOtpToken");
            localStorage.removeItem("resetPasswordOtpCode");

            // Navigate to login page after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } else {
            setError(result.message || "Password reset failed");
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
                            alt="reset password form"
                            className="img-fluid rounded-start w-100"
                        />
                    </div>

                    <div className="col-md-6 d-flex align-items-center">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <div className="d-flex flex-row mt-2 align-items-center">
                                <i
                                    className="fas fa-key fa-3x me-3"
                                    style={{ color: "#ff6219" }}
                                ></i>
                                <span className="h1 fw-bold mb-0">Reset Password</span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Enter your new password
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
                                <div className="form-outline mb-3">
                                    <label className="form-label" htmlFor="newPassword">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        className="form-control form-control-lg"
                                        placeholder="Enter your new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="form-outline mb-4">
                                    <label className="form-label" htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        className="form-control form-control-lg"
                                        placeholder="Re-enter your new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <button
                                    className="btn btn-dark btn-lg btn-block w-100 mb-4"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>

                                <div className="text-center">
                                    <Link to="/verify-otp-reset" className="small text-muted">
                                        Back to Verify OTP
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

export default ResetPasswordScreen;
