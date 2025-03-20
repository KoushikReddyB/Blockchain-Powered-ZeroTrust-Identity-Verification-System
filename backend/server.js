const express = require("express");
const { Web3 } = require("web3");
const cors = require("cors");
const chalk = require("chalk");
require("dotenv").config(); // Use environment variables for security
const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(cors());

// 📡 Connect to local Ethereum blockchain (Ganache or Hardhat)
const web3 = new Web3("http://127.0.0.1:8545");

// ⚡ Load environment variables (store these securely!)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ACCOUNT_ADDRESS = "0xc392bceC161827C804A98b339Aac89eBB75bCa30";
const PRIVATE_KEY = "0x696d09e266f5325e348884fe5a76a942002350636cc852ff8f0aec4e4f832fa7"; // Account for transactions

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
 * 📌 Function to send a signed transaction
 */
async function sendTransaction(txObject, userAddress = ACCOUNT_ADDRESS) {
    try {
        const gas = await txObject.estimateGas({ from: userAddress });
        const gasPrice = await web3.eth.getGasPrice();
        const txData = txObject.encodeABI();
        const nonce = await web3.eth.getTransactionCount(userAddress);

        const tx = {
            from: userAddress,
            to: CONTRACT_ADDRESS,
            gas,
            gasPrice,
            nonce,
            data: txData,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        console.log(chalk.greenBright("✅ Transaction successful! 🚀"));
        return receipt;
    } catch (error) {
        console.log(chalk.redBright("❌ Transaction failed... 😵"));
        console.error(error);
        throw error;
    }
}

/**
 * 📌 Register a new user (supports multiple users per address)
 */
/**
 * 📌 Register a new user (supports multiple users per address)
 */
app.post("/register", async (req, res) => {
  const { email, passwordHash, fingerprintHash } = req.body;
  console.log(chalk.blueBright(`[INFO] Registering user: ${email}`));

  try {
      // 🔍 Check if the email is already registered
      const emailHash = web3.utils.keccak256(email);
      let userData;
      try {
          userData = await contract.methods.getUserByEmail(email).call();
      } catch (error) {
          console.log("[WARNING] User not found, proceeding with registration...");
      }

      if (userData && userData[0] !== "") {
          console.log("[ERROR] Email already in use!");
          return res.status(400).json({ success: false, error: "Email already in use!" });
      }

      // 🔄 Register new user
      const txObject = contract.methods.registerUser(email, passwordHash, fingerprintHash);
      const receipt = await sendTransaction(txObject);

      console.log(chalk.greenBright(`[SUCCESS] User registered successfully: ${email}`));
      res.json({
          success: true,
          message: "User registered successfully!",
          receipt,
      });
  } catch (error) {
      console.log(chalk.redBright("[ERROR] Registration failed:"), error);
      res.status(500).json({ success: false, error: error.message });
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
    const { email, passwordHash, newFingerprintHash, userAddress } = req.body;
    console.log(chalk.blueBright(`🔄 Updating fingerprint for: ${email} (${userAddress})`));

    try {
        const txObject = contract.methods.updateFingerprint(newFingerprintHash, email, passwordHash);
        const receipt = await sendTransaction(txObject, userAddress);
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * 🚀 Start the Express Server
 */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(chalk.greenBright(`✅ Server is LIVE! 🚀 Ready at: http://localhost:${PORT}`));
});
