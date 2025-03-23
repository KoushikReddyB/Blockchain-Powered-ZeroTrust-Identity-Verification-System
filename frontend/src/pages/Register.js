import React, { useState, useEffect } from "react";
import { registerUser, verifyOTP } from "../services/api";
import InputField from "../components/InputField";
import PasswordField from "../components/PasswordField";
import { getDeviceFingerprint } from "../utils/fingerprint";

const Register = () => {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [otp, setOtp] = useState("");
  const [fingerprintHash, setFingerprintHash] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprintHash);
  }, []);

  const handleRegister = async () => {
    try {
      await registerUser(email, passwordHash, fingerprintHash);
      alert("OTP sent to email!");
      setStep(2);
    } catch (error) {
      alert("Registration failed!");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await verifyOTP(email, otp);
      alert("User registered successfully!");
    } catch (error) {
      alert("Invalid OTP!");
    }
  };

  return (
    <div>
      {step === 1 ? (
        <>
          <h2>Register</h2>
          <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordField setPasswordHash={setPasswordHash} />
          <button onClick={handleRegister}>Register</button>
        </>
      ) : (
        <>
          <h2>Verify OTP</h2>
          <InputField label="OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
          <button onClick={handleVerifyOTP}>Verify</button>
        </>
      )}
    </div>
  );
};

export default Register;
