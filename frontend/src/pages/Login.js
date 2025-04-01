import React, { useState, useEffect } from "react";
import { loginUser } from "../services/api";
import { getDeviceFingerprint } from "../utils/fingerprint";
import SHA256 from "crypto-js/sha256";  
import "../pages/css/Auth.css";  

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [fingerprintHash, setFingerprintHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get device fingerprint on component mount
  useEffect(() => {
    getDeviceFingerprint().then(setFingerprintHash);
  }, []);

  // Update password hash when password changes
  useEffect(() => {
    if (password) {
      setPasswordHash(SHA256(password).toString());  // Hash the password using sha256
    }
  }, [password]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Send login request
      const response = await loginUser(email, passwordHash, fingerprintHash);
      
      // If login is successful
      alert(response.data.message);  // Show success message from the API
    } catch (error) {
      const errorMessage = error?.response?.data?.error || "Login failed. Please check your credentials.";
      setError(errorMessage); // Set error message received from server
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="page-container">
      <div className="left-panel">
        <div className="quote-container">
          <h3>Welcome to ZeroTrust</h3>
          <p className="quote">"Decentralized security for a trustless world"</p>
          <p className="features">• Advanced blockchain security</p>
          <p className="features">• Fingerprint authentication</p>
          <p className="features">• Secure device verification</p>
          <p className="features">• Zero knowledge proofs</p>
        </div>
      </div>

      <div className="auth-container">
        <div className="glow glow-top-right"></div>
        <div className="glow glow-bottom-left"></div>
        
        <h2>Login</h2>

        {/* Email Input */}
        <div className="input-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder=" "
            id="email"
            required
          />
          <label htmlFor="email">Email</label>
        </div>

        {/* Password Input */}
        <div className="input-group password-field">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder=" "
            id="password"
            required
          />
          <label htmlFor="password">Password</label>
          <button
            type="button"
            className="password-toggle"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Error message display */}
        {error && <div className="error-message">{error}</div>}

        {/* Login button with loading spinner */}
        <button
          className="auth-button"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading && <span className="loading-spinner"></span>}
          Login
        </button>

        {/* Link to Register if the user doesn't have an account */}
        <div className="auth-switch">
          Don't have an account? <a href="/register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
