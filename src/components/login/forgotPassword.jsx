import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function ForgotPasswordScreen() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const { sendOTPResetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const result = await sendOTPResetPassword(email);

        if (result.success) {
            setSuccess(result.message || "OTP has been sent to your email");
            // Save email and otpToken for use in verify OTP step
            localStorage.setItem("resetPasswordEmail", email);
            localStorage.setItem("resetPasswordOtpToken", result.otpToken);
            // Navigate to verify OTP page after 1.5 seconds
            setTimeout(() => {
                navigate("/verify-otp-reset");
            }, 1500);
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
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                            alt="forgot password form"
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
                                <span className="h1 fw-bold mb-0">Forgot Password</span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Enter your email to receive OTP code
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
                                    <label className="form-label" htmlFor="email">
                                        Email address
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

                                <button
                                    className="btn btn-dark btn-lg btn-block mb-4 px-5 w-100"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </form>

                            <div className="text-center">
                                <Link to="/login" className="small text-muted">
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordScreen;

