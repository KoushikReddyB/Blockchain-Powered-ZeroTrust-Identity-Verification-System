import React, { useState } from "react";
import CryptoJS from "crypto-js";

const PasswordField = ({ setPasswordHash }) => {
  const [password, setPassword] = useState("");

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordHash(CryptoJS.SHA256(e.target.value).toString());
  };

  return (
    <div>
      <label>Password</label>
      <input type="password" value={password} onChange={handlePasswordChange} required />
    </div>
  );
};

export default PasswordField;
