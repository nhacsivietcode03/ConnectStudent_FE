import { Link } from "react-router-dom";

function LoginScreen() {
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
                                    style={{ color: "#ff6219" }}
                                ></i>
                                <span className="h1 fw-bold mb-0">Logo</span>
                            </div>

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                Sign into your account
                            </h5>

                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="email">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your email"
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
                                />
                            </div>

                            <button
                                className="btn btn-dark btn-lg btn-block mb-4 px-5"
                                type="button"
                            >
                                Login
                            </button>

                            <Link to='/sendemail' className="small text-muted d-block" >
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
