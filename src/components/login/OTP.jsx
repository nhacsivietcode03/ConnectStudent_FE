import { Link } from "react-router-dom";

function OTP() {
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
                        <form className="w-100">
                            <h5
                                className="fw-normal my-4 pb-3 text-center"
                                style={{ letterSpacing: "1px" }}
                            >
                                Enter Verification Code
                            </h5>

                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="otp-input">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="otp-input"
                                    className="form-control form-control-lg"
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <div className="text-center">
                                <button
                                    className="btn btn-dark btn-lg px-5 mb-3"
                                    type="submit"
                                >
                                    Verify
                                </button>

                                <Link
                                    to="/sendemail"
                                    className="small text-muted d-block mt-2"
                                >
                                    Back to send email
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
