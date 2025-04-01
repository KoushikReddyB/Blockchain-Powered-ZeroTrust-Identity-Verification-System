import React, { useState, useEffect } from "react";
import { registerUser, verifyOTP } from "../services/api";
import { getDeviceFingerprint } from "../utils/fingerprint";
import { sha256 } from "crypto-js"; // Assuming you're using this for password hashing
import "../pages/css/Auth.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [otp, setOtp] = useState("");
  const [fingerprintHash, setFingerprintHash] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprintHash);
  }, []);

  // Update password hash when password changes
  useEffect(() => {
    if (password) {
      setPasswordHash(sha256(password).toString());
    }
  }, [password]);

  const handleRegister = async () => {
    try {
      setIsLoading(true);
      setError("");
      await registerUser(email, passwordHash, fingerprintHash);
      setStep(2);
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setIsLoading(true);
      setError("");
      await verifyOTP(email, otp);
      alert("User registered successfully!");
    } catch (error) {
      setError("Invalid OTP. Please check and try again.");
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
          <h3>Join ZeroTrust Today</h3>
          <p className="quote">"Security through transparency, not obscurity"</p>
          <p className="features">• Cutting-edge blockchain authentication</p>
          <p className="features">• Decentralized identity verification</p>
          <p className="features">• Multi-factor security protocols</p>
          <p className="features">• Quantum-resistant encryption</p>
        </div>
      </div>
      
      <div className="auth-container">
        <div className="glow glow-top-right"></div>
        <div className="glow glow-bottom-left"></div>
        
        {step === 1 ? (
          <>
            <h2>Register</h2>
            
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
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              className="auth-button" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading && <span className="loading-spinner"></span>}
              Register
            </button>
            
            <div className="auth-switch">
              Already have an account? <a href="/login">Login</a>
            </div>
          </>
        ) : (
          <div className="otp-section">
            <h2>Verify OTP</h2>
            
            {/* OTP Input */}
            <div className="input-group">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field otp-field"
                placeholder=" "
                id="otp"
                required
              />
              <label htmlFor="otp">OTP</label>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              className="auth-button" 
              onClick={handleVerifyOTP}
              disabled={isLoading}
            >
              {isLoading && <span className="loading-spinner"></span>}
              Verify
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;