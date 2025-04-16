const express = require("express");
const { Web3 } = require("web3");
const cors = require("cors");
const chalk = require("chalk");
require("dotenv").config();
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const { generateOTP, sendOTP, verifyOTP, otpStore } = require("./otpService");

const app = express();
app.use(express.json());
app.use(cors());

// 📡 Connect to local Ethereum blockchain (Ganache or Hardhat)
const web3 = new Web3("http://13.60.241.5:8545");

// ⚡ Load environment variables (store these securely!)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ACCOUNT_ADDRESS = "0x28fcc0e92A4F6EAD9e8d75C6F7327D4E575F1E36";
const PRIVATE_KEY = "0x68abde94c9fa3eb4bc0992f007d0861acd4b79988853c1fedd9ab3fb67893f27"; // Account for transactions

// ✅ Smart Contract ABI (Replace this with your actual ABI)
const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      }
    ],
    "name": "FingerprintUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "LoginAttempt",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "email",
        "type": "string"
      }
    ],
    "name": "UserRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "password",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fingerprint",
        "type": "string"
      }
    ],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "password",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fingerprint",
        "type": "string"
      }
    ],
    "name": "verifyLogin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      }
    ],
    "name": "getAddressByEmail",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "newFingerprint",
        "type": "string"
      }
    ],
    "name": "updateFingerprint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddress",
        "type": "address"
      }
    ],
    "name": "getUsersByAddress",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "email",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "passwordHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "fingerprintHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256",
            "name": "lastUpdateTimestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct IdentityVerification.User[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "email",
        "type": "string"
      }
    ],
    "name": "getUserByEmail",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

// ✅ Fix BigInt Serialization Issue
BigInt.prototype.toJSON = function () {
  return this.toString();
};

/**
 * 📌 Function to send a signed transaction with error handling
 */
async function sendTransaction(txObject, userAddress = ACCOUNT_ADDRESS) {
  try {
      const gas = await txObject.estimateGas({ from: userAddress });
      const gasPrice = await web3.eth.getGasPrice();
      const txData = txObject.encodeABI();
      const nonce = await web3.eth.getTransactionCount(userAddress);

      // ✅ Convert gas values to normal numbers (avoid BigInt issues)
      const tx = {
          from: userAddress,
          to: CONTRACT_ADDRESS,
          gas: Number(gas) + 50000, // Ensure gas is a number
          gasPrice: Number(gasPrice), // Convert gasPrice from BigInt
          nonce: Number(nonce), // Convert nonce from BigInt
          data: txData,
      };

      // Sign & send transaction
      const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
      const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      console.log(chalk.greenBright("✅ Transaction successful! 🚀"));
      return receipt;
  } catch (error) {
      console.error(chalk.redBright("❌ Transaction failed:"), error.message || error);
      throw error;
  }
}



// ✅ Store user details temporarily before OTP verification
const pendingRegistrations = {};

/**
* 📌 Step 1: Initialize Registration & Send OTP
*/
app.post("/register-init", async (req, res) => {
  const { email, passwordHash, fingerprintHash } = req.body;

  if (!email || !passwordHash || !fingerprintHash) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  pendingRegistrations[email] = { passwordHash, fingerprintHash };

  const otp = generateOTP();
  otpStore[email] = { otp, timestamp: Date.now() };

  const sent = await sendOTP(email, otp);
  if (!sent) {
      return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }

  console.log(`[INFO] OTP sent to ${email}`);
  res.json({ success: true, message: "OTP sent successfully!" });
});

/**
* 📌 Step 2: Verify OTP & Register User on Blockchain
*/
app.post("/register-verify", async (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(401).json({ success: false, error: "Invalid or expired OTP" });
  }
  delete otpStore[email];

  const userData = pendingRegistrations[email];
  if (!userData) {
      return res.status(400).json({ success: false, error: "No registration request found" });
  }

  try {
      const { passwordHash, fingerprintHash } = userData;
      const txObject = contract.methods.registerUser(email, passwordHash, fingerprintHash);
      const receipt = await sendTransaction(txObject);

      console.log(`[SUCCESS] User registered on blockchain: ${email}`);
      res.json({ success: true, message: "User registered successfully!", receipt });
  } catch (error) {
      res.status(500).json({ success: false, error: "Blockchain registration failed" });
  } finally {
      delete pendingRegistrations[email];
  }
});

/**
 * 📌 Login Verification (Supports Multiple Users)
 */
app.post("/login", async (req, res) => {
  const { email, passwordHash, fingerprintHash } = req.body;
  console.log(`[INFO] Login attempt for: ${email}`);

  try {
      // Fetch user data from the contract using email
      const userData = await contract.methods.getUserByEmail(email).call();

      // Check if the user exists
      if (!userData[0]) {
          console.log(`[ERROR] User not found: ${email}`);
          return res.status(404).json({ success: false, error: "User not found!" });
      }

      // 🔄 Extract stored data
      const storedEmail = userData[0];
      const storedPassword = userData[1];
      const storedFingerprint = userData[2];

      // 🔥 Fix: Handle the return object correctly
      const loginResult = await contract.methods.verifyLogin(email, passwordHash, fingerprintHash).call();
      const isValid = loginResult[0];


      const message = loginResult[1];
      
      // 🔍 Identify the exact login failure reason
      if (!isValid) {
          let errorMessage;

          if (web3.utils.keccak256(fingerprintHash) !== storedFingerprint) {
              errorMessage = "Invalid Authentication Attempt: Device Integrity is not matching!";
          } else if (web3.utils.keccak256(passwordHash) !== storedPassword) {
              errorMessage = "Invalid Authentication Attempt: Wrong Credentials!";
          } else {
              errorMessage = "Invalid Authentication Attempt!";
          }

          console.log(`[ERROR] ${errorMessage} for ${email}`);
          return res.status(401).json({ success: false, error: errorMessage });
      }

      console.log(`[SUCCESS] Login successful for: ${email}`);
      res.json({
          success: true,
          message: "Login successful!",
      });

  } catch (error) {
      console.log(`[ERROR] Login error for ${email}:`, error);
      res.status(500).json({ success: false, error: "Server error!" });
  }
});

/**
 * 📌 Get ALL Users for an Address
 */
app.get("/user/:userAddress", async (req, res) => {
  const { userAddress } = req.params;
  console.log(`[INFO] Fetching users for: ${userAddress}`);

  try {
      // 🔄 Fetch all users linked to the address
      const users = await contract.methods.getUsersByAddress(userAddress).call();

      if (users.length === 0) {
          console.log(`[ERROR] No users found for address: ${userAddress}`);
          return res.status(404).json({ success: false, error: "No users found!" });
      }

      // Convert BigInt to strings if necessary
      const formattedUsers = users.map(user => ({
          email: user[0],
          credentialsHash: user[1],
          fingerprintHash: user[2],
      }));

      console.log(`[SUCCESS] Found ${formattedUsers.length} user(s) for address: ${userAddress}`);
      res.json({
          success: true,
          users: formattedUsers,
      });

  } catch (error) {
      console.log(`[ERROR] Fetching users failed for ${userAddress}:`, error);
      res.status(500).json({ success: false, error: "Server error!" });
  }
});

/**
 * 📌 Update User Fingerprint
 */
app.post("/update-fingerprint", async (req, res) => {
  const { email, passwordHash, newFingerprintHash, otp } = req.body;
  console.log(chalk.blueBright(`🔄 Updating fingerprint for: ${email}`));

  // 🔍 OTP Verification
  if (!otpStore[email] || otpStore[email].otp !== otp) {
      console.log(`[ERROR] Invalid OTP for fingerprint update: ${email}`);
      return res.status(401).json({ success: false, error: "Invalid or expired OTP" });
  }
  delete otpStore[email]; // ✅ Clear OTP after use

  try {
      // 📌 Fetch user blockchain address
      const userAddress = await contract.methods.getAddressByEmail(email).call();
      console.log(`[DEBUG] Resolved User Address: ${userAddress}`);

      // 🔍 Validate Ethereum Address
      if (!web3.utils.isAddress(userAddress) || userAddress === "0x0000000000000000000000000000000000000000") {
          console.log(`[ERROR] User not found on blockchain: ${email}`);
          return res.status(404).json({ success: false, error: "User not found on blockchain!" });
      }

      // 📌 Update fingerprint on the blockchain
      const txObject = contract.methods.updateFingerprint(email, newFingerprintHash);
      
      const gasLimit = await txObject.estimateGas({ from: userAddress }); // ✅ Estimate gas correctly

      const receipt = await txObject.send({
          from: userAddress,
          gas: gasLimit,
          gasPrice: await web3.eth.getGasPrice() // ✅ Ensure correct gas pricing
      });

      console.log(`[SUCCESS] Fingerprint updated successfully for: ${email}`);
      res.json({ success: true, receipt });
  } catch (error) {
      console.error(`[ERROR] Fingerprint update failed for ${email}:`, error);
      res.status(500).json({ success: false, error: error.message });
  }
});


/**
 *  📌 OTP Services
 */

// 📌 Rate limiter for OTP requests (max 3 per 10 min)
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Allow only 3 requests per window
  message: { success: false, error: "Too many OTP requests! Try again later." },
});

// ✅ Function to Check OTP Validity
function isOtpValid(email, otp) {
    if (!otpStore[email]) return false;
    
    const { otp: storedOtp, timestamp } = otpStore[email];
    const now = Date.now();

    // Check if OTP matches & is within 5 minutes
    if (storedOtp === otp && now - timestamp < 300000) {
        delete otpStore[email]; // Remove OTP after use
        return true;
    }
    return false;
}

/**
 * 📌 API: Request OTP (for Registration & Updates)
 */
app.post("/request-otp", otpLimiter, async (req, res) => {
  const { email } = req.body;
  console.log(`[INFO] OTP request for: ${email}`);

  const otp = generateOTP();
  const sent = await sendOTP(email, otp);

  if (!sent) {
      return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }

  res.json({ success: true, message: "OTP sent successfully!" });
});

// ✅ Verify OTP API
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyOTP(email, otp);

  if (!result.success) {
      return res.status(401).json({ success: false, error: result.error });
  }

  res.json({ success: true, message: "OTP verified successfully!" });
});

/**
 * 🚀 Start the Express Server
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(chalk.greenBright(`✅ Server is LIVE! 🚀 Ready at: http://0.0.0.0:${PORT}`));
});
