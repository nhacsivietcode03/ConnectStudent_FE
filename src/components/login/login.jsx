import React, { useState } from "react";

function LoginScreen() {
  // Trạng thái để quản lý chế độ hiển thị: 'LOGIN', 'FORGOT_PASSWORD', hoặc 'OTP'
  const [mode, setMode] = useState("LOGIN");

  // Trạng thái để lưu trữ dữ liệu người dùng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // Xử lý sự kiện (Tạm thời chỉ log ra console và đổi chế độ)
  const handleLogin = (e) => {
    e.preventDefault(); // Ngăn form submit lại trang
    console.log("Đăng nhập với:", { email, password });
    // Thêm logic gọi API đăng nhập ở đây
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    console.log("Yêu cầu OTP cho email:", email);
    // ... Thêm logic gọi API gửi OTP ở đây ...

    // Sau khi gửi thành công, chuyển sang chế độ nhập OTP
    setMode("OTP");
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    console.log("Xác thực OTP:", otp);
    // Thêm logic gọi API xác thực OTP ở đây
    // Sau khi xác thực, có thể chuyển người dùng đến trang Đặt lại mật khẩu mới
    // hoặc đăng nhập
  };

  // Quay lại đăng nhập
  const goToLogin = (e) => {
    e.preventDefault();
    setMode("LOGIN");
    // Xóa các trường không liên quan
    setOtp("");
  };

  // Hàm tiện ích để đến trang yêu cầu OTP
  const goToForgotPassword = (e) => {
    e.preventDefault();
    setMode("FORGOT_PASSWORD");
    // Xóa mật khẩu
    setPassword("");
  };

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
              {/* --- CHẾ ĐỘ: ĐĂNG NHẬP (LOGIN) --- */}
              {mode === "LOGIN" && (
                <form onSubmit={handleLogin}>
                  <h5
                    className="fw-normal my-4 pb-3"
                    style={{ letterSpacing: "1px" }}
                  >
                    Sign into your account
                  </h5>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="email-login">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email-login"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="password-login">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password-login"
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="btn btn-dark btn-lg btn-block mb-4 px-5"
                    type="submit"
                  >
                    Login
                  </button>

                  <a
                    className="small text-muted d-block"
                    href="#!"
                    onClick={goToForgotPassword}
                  >
                    Forgot password?
                  </a>
                  <p className="mb-5 pb-lg-2" style={{ color: "#393f81" }}>
                    Don't have an account?{" "}
                    <a href="#!" style={{ color: "#393f81" }}>
                      Register here
                    </a>
                  </p>
                </form>
              )}

              {/* --- CHẾ ĐỘ: QUÊN MẬT KHẨU (NHẬP EMAIL) --- */}
              {mode === "FORGOT_PASSWORD" && (
                <form onSubmit={handleRequestOtp}>
                  <h5
                    className="fw-normal my-4 pb-3"
                    style={{ letterSpacing: "1px" }}
                  >
                    Reset Password
                  </h5>
                  <p className="text-muted mb-4">
                    Enter your email address and we'll send a verification code.
                  </p>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="email-forgot">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email-forgot"
                      className="form-control form-control-lg"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    className="btn btn-dark btn-lg btn-block mb-4 px-5"
                    type="submit"
                  >
                    Send Code
                  </button>

                  <a
                    className="small text-muted d-block"
                    href="#!"
                    onClick={goToLogin}
                  >
                    Back to login
                  </a>
                </form>
              )}

              {/* --- CHẾ ĐỘ: NHẬP OTP --- */}
              {mode === "OTP" && (
                <form onSubmit={handleVerifyOtp}>
                  <h5
                    className="fw-normal my-4 pb-3"
                    style={{ letterSpacing: "1px" }}
                  >
                    Enter Verification Code
                  </h5>
                  <p className="text-muted mb-4">
                    We've sent a 6-digit code to{" "}
                    <strong>{email || "your email"}</strong>.
                  </p>

                  <div className="form-outline mb-4">
                    <label className="form-label" htmlFor="otp-input">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp-input"
                      className="form-control form-control-lg"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>

                  <button
                    className="btn btn-dark btn-lg btn-block mb-4 px-5"
                    type="submit"
                  >
                    Verify
                  </button>

                  <a
                    className="small text-muted d-block"
                    href="#!"
                    onClick={goToLogin}
                  >
                    Back to login
                  </a>
                </form>
              )}
              <div className="d-flex flex-row justify-content-start pt-4">
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
