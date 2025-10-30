import { Link } from "react-router-dom";

function RegisterScreen() {
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

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="username">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your username"
                                />
                            </div>

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="role">Role</label>
                                <select id="role" className="form-select form-select-lg">
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="major">Major</label>
                                <input
                                    type="text"
                                    id="major"
                                    className="form-control form-control-lg"
                                    placeholder="Enter your major"
                                />
                            </div>

                            <div className="form-outline mb-3">
                                <label className="form-label" htmlFor="avater">Avatar URL</label>
                                <input
                                    type="text"
                                    id="avater"
                                    className="form-control form-control-lg"
                                    placeholder="Enter avatar image URL"
                                />
                            </div>

                            <div className="form-outline mb-4">
                                <label className="form-label" htmlFor="bio">Bio</label>
                                <textarea
                                    id="bio"
                                    className="form-control form-control-lg"
                                    placeholder="Tell us something about yourself"
                                    rows="3"
                                ></textarea>
                            </div>

                            <button className="btn btn-dark btn-lg btn-block mb-4 px-5" type="button">
                                Register
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterScreen;
