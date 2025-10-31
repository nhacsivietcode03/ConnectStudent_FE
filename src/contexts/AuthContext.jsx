import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth.api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (savedUser && accessToken) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            if (response.success) {
                const { accessToken, refreshToken, user: userData } = response;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const sendOTP = async (email) => {
        try {
            const response = await authAPI.sendOTP(email);
            return response;
        } catch (error) {
            console.error("Send OTP Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed',
                errors: error.response?.data?.errors,
            };
        }
    };

    const sendOTPResetPassword = async (email) => {
        try {
            const response = await authAPI.sendOTPResetPassword(email);
            return response;
        } catch (error) {
            console.error("Send OTP Reset Password Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to send OTP',
            };
        }
    };

    const resetPassword = async (email, otpCode, otpToken, newPassword) => {
        try {
            const response = await authAPI.resetPassword(email, otpCode, otpToken, newPassword);
            return response;
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Password reset failed',
            };
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        sendOTP,
        register,
        sendOTPResetPassword,
        resetPassword,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

