import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import HomePage from "./components/HomePage";
import UserProfile from "./components/user/userProfile";
import AdminHomePage from "./components/admin/adminHomePage";
import LoginScreen from "./components/login/login";
import RegisterScreen from "./components/login/register";
import OTP from "./components/login/OTP";
import ForgotPasswordScreen from "./components/login/forgotPassword";
import VerifyOtpResetScreen from "./components/login/verifyOtpReset";
import ResetPasswordScreen from "./components/login/resetPassword";
import PostDetailPage from "./components/user/PostDetailPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin Protected Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (user?.role !== "admin") {
        return <Navigate to="/" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <SocketProvider>
                    <div className="App">
                        <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <HomePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <UserProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminHomePage />
                                </AdminRoute>
                            }
                        />
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />
                        <Route path="/otp" element={<OTP />} />
                        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                        <Route path="/verify-otp-reset" element={<VerifyOtpResetScreen />} />
                        <Route path="/reset-password" element={<ResetPasswordScreen />} />
						<Route
							path="/posts/:id"
							element={
								<ProtectedRoute>
									<PostDetailPage />
								</ProtectedRoute>
							}
						/>
                        </Routes>
                    </div>
                </SocketProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
