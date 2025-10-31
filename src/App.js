import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import UserHomePage from "./components/user/userHomePage";
import LoginScreen from './components/login/login';
import RegisterScreen from './components/login/register';
import OTP from './components/login/OTP';
import ForgotPasswordScreen from './components/login/forgotPassword';
import VerifyOtpResetScreen from './components/login/verifyOtpReset';
import ResetPasswordScreen from './components/login/resetPassword';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<ProtectedRoute><UserHomePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path='/register' element={<RegisterScreen />} />
            <Route path='/otp' element={<OTP />} />
            <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
            <Route path='/verify-otp-reset' element={<VerifyOtpResetScreen />} />
            <Route path='/reset-password' element={<ResetPasswordScreen />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
