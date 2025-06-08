import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isLogin, setIsLogin] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setIsLogin(params.get('mode') !== 'signup');
        setIsForgotPassword(false);
        setResetMessage('');
    }, [location.search]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!isForgotPassword && !formData.password) newErrors.password = 'Password is required';
        if (!isLogin && !isForgotPassword) {
            if (!formData.username) newErrors.username = 'Username is required';
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        if (!formData.email) {
            setErrors({ email: 'Email is required for password reset' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }

            setResetMessage('Password reset instructions have been sent to your email.');
            setFormData(prev => ({ ...prev, email: '' }));
        } catch (error) {
            setErrors({
                submit: error.message || 'Failed to send reset instructions'
            });
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
    
        if (validateForm()) {
            try {
                const endpoint = isLogin ? "/auth/login" : "/auth/signup";
                const requestBody = {
                    email: formData.email,
                    password: formData.password,
                    ...(isLogin ? {} : { username: formData.username }),
                };
    
                const response = await fetch(`http://localhost:5000${endpoint}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });
    
                const data = await response.json();
                console.log("Server response:", data);
    
                if (!response.ok) {
                    throw new Error(data.error || "Authentication failed");
                }
    
                if (response.ok) {
                    localStorage.setItem("token", data.token); // Store token
                    localStorage.setItem("user", JSON.stringify(data.user)); // Store user details
    
                    window.dispatchEvent(new Event("authUpdated")); // Notify Header.js
                    alert(isLogin ? "Login Successful!" : "Sign Up Successful!");
                    navigate("/");
                }
            } catch (error) {
                setErrors({
                    submit: error.message || "An error occurred. Please try again.",
                });
            }
        }
        setIsLoading(false);
    };
    
    const switchMode = () => {
        setIsLogin(!isLogin);
        setIsForgotPassword(false);
        setErrors({});
        setResetMessage('');
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            username: ''
        });
        navigate(isLogin ? '/login?mode=signup' : '/login');
    };

    const toggleForgotPassword = () => {
        setIsForgotPassword(!isForgotPassword);
        setErrors({});
        setResetMessage('');
        setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: ''
        }));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>{isForgotPassword ? 'Reset Password' : (isLogin ? 'Login' : 'Sign Up')}</h2>
                <form onSubmit={isForgotPassword ? handleForgotPassword : handleSubmit}>
                    {!isLogin && !isForgotPassword && (
                        <div className="form-group">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {errors.username && <span className="error">{errors.username}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>

                    {!isForgotPassword && (
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>
                    )}

                    {!isLogin && !isForgotPassword && (
                        <div className="form-group">
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>
                    )}

                    {errors.submit && <span className="error">{errors.submit}</span>}
                    {resetMessage && <span className="success">{resetMessage}</span>}

                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Please wait...' :
                            (isForgotPassword ? 'Send Reset Instructions' :
                                (isLogin ? 'Login' : 'Sign Up'))}
                    </button>
                </form>

                <div className="auth-links">
                    <p className="toggle-form">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span onClick={switchMode}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </span>
                    </p>
                    {isLogin && !isForgotPassword && (
                        <p className="forgot-password">
                            <span onClick={toggleForgotPassword}>Forgot Password?</span>
                        </p>
                    )}
                    {isForgotPassword && (
                        <p className="back-to-login">
                            <span onClick={toggleForgotPassword}>Back to Login</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
