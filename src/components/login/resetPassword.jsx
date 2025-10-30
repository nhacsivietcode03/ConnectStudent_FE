import { Link } from "react-router-dom";

function ResetPasswordScreen() {
    return (
        <div className="container my-5">
            <div className="card">
                <div className="row g-0">
                    {/* Ảnh minh họa */}
                    <div className="col-md-6">
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                            alt="reset password form"
                            className="img-fluid rounded-start w-100"
                        />
                    </div>

                    {/* Form */}
                    <div className="col-md-6 d-flex align-items-center">
                        <div className="card-body p-4 p-lg-5 text-black">
                            <h3 className="fw-bold mb-4 text-center">Reset Password</h3>

                            {/* New password */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="newPassword">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your new password"
                                />
                            </div>

                            {/* Confirm password */}
                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="confirmPassword">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-control form-control-lg"
                                    placeholder="Re-enter your new password"
                                />
                            </div>

                            <button
                                className="btn btn-dark btn-lg btn-block w-100 mb-3"
                                type="button"
                            >
                                Reset Password
                            </button>

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

export default ResetPasswordScreen;
