import { Link } from "react-router-dom";


function SendEmailScreen() {
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

                            <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: "1px" }}>
                                <h3>Reset PassWord</h3>
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


                            <button
                                className="btn btn-dark btn-lg btn-block mb-4 px-5"
                                type="button"
                            >
                               <Link to="/otp"> Continue</Link>
                            </button>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SendEmailScreen;
