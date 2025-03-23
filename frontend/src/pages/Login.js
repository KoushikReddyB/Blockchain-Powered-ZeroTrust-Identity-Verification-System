import React, { useState, useEffect } from "react";
import { loginUser } from "../services/api";
import InputField from "../components/InputField";
import PasswordField from "../components/PasswordField";
import { getDeviceFingerprint } from "../utils/fingerprint";

const Login = () => {
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [fingerprintHash, setFingerprintHash] = useState("");

  useEffect(() => {
    getDeviceFingerprint().then(setFingerprintHash);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await loginUser(email, passwordHash, fingerprintHash);
      alert(response.data.message);
    } catch (error) {
      alert("Login failed!");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <InputField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <PasswordField setPasswordHash={setPasswordHash} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
