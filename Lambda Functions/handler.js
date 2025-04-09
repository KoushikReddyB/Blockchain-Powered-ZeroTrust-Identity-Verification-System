const crypto = require("crypto");

let otpStore = {}; // In-memory OTP store

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Simulated Blockchain Sign
const signOnBlockchain = async (walletAddress, otp) => {
  return `Signed:${walletAddress}:${otp}`;
};

// 1️⃣ Register Init - Generate OTP
module.exports.registerInit = async (event) => {
  const { walletAddress } = JSON.parse(event.body);
  if (!walletAddress) return { statusCode: 400, body: JSON.stringify({ error: "Wallet address required" }) };

  const otp = generateOTP();
  otpStore[walletAddress] = { otp, expiresAt: Date.now() + process.env.OTP_EXPIRY * 1000 };

  return { statusCode: 200, body: JSON.stringify({ message: "OTP sent", otp }) };
};

// 2️⃣ Register Verify - Blockchain Signing
module.exports.registerVerify = async (event) => {
  const { walletAddress, otp } = JSON.parse(event.body);
  const storedOTP = otpStore[walletAddress];

  if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiresAt) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid or expired OTP" }) };
  }

  const signedData = await signOnBlockchain(walletAddress, otp);
  delete otpStore[walletAddress]; // OTP used, remove it

  return { statusCode: 200, body: JSON.stringify({ message: "Registration successful", signedData }) };
};

// 3️⃣ Login - Similar to Register Init
module.exports.login = async (event) => {
  const { walletAddress } = JSON.parse(event.body);
  if (!walletAddress) return { statusCode: 400, body: JSON.stringify({ error: "Wallet address required" }) };

  const otp = generateOTP();
  otpStore[walletAddress] = { otp, expiresAt: Date.now() + process.env.OTP_EXPIRY * 1000 };

  return { statusCode: 200, body: JSON.stringify({ message: "OTP sent", otp }) };
};
