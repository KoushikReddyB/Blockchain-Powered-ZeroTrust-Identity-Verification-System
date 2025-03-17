const express = require("express");
const{ Web3 } = require("web3");
const cors = require("cors");

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// Connect to Ganache
const web3 = new Web3("http://127.0.0.1:7545");

// Hardcoded contract details
const CONTRACT_ADDRESS = "0xDb5a1089fb28c5E649DAcB303613B57fCCa1B31f";

const contractABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "passwordHash",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "fingerprintHash",
          "type": "string"
        }
      ],
      "name": "UserRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "users",
      "outputs": [
        {
          "internalType": "string",
          "name": "email",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "passwordHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "fingerprintHash",
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
          "name": "passwordHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "fingerprintHash",
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
          "name": "passwordHash",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "fingerprintHash",
          "type": "string"
        }
      ],
      "name": "verifyLogin",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "userAddress",
          "type": "address"
        }
      ],
      "name": "getFingerprintHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    }
  ];

// Load contract
const contract = new web3.eth.Contract(contractABI, CONTRACT_ADDRESS);

// Use a predefined Ganache account
const ACCOUNT_ADDRESS = "0x122c5Bb8B0AeEaB311f7fe3BcBC0121A5086F6a1";
const PRIVATE_KEY = "0xa0a1506ce5a62ca3cbe81b05bace18c6f1c25717527fd5e07718fad78f6e1844";

// Function to send transactions
async function sendTransaction(txObject) {
    try {
        const gas = await txObject.estimateGas({ from: ACCOUNT_ADDRESS });
        const gasPrice = await web3.eth.getGasPrice();
        const txData = txObject.encodeABI();

        const tx = {
            from: ACCOUNT_ADDRESS,
            to: CONTRACT_ADDRESS,
            gas,
            gasPrice,
            data: txData,
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        return receipt;
    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
}

// ✅ Register User
// ✅ Register User (Fixed)
app.post("/register", async (req, res) => {
    const { email, passwordHash, fingerprintHash } = req.body;

    console.log("Registering user...", { email, passwordHash, fingerprintHash });

    try {
        const txObject = contract.methods.registerUser(email, passwordHash, fingerprintHash);
        const receipt = await sendTransaction(txObject);

        // ✅ Convert all BigInt values to strings before sending JSON response
        const cleanReceipt = JSON.parse(
            JSON.stringify(receipt, (key, value) => (typeof value === "bigint" ? value.toString() : value))
        );

        console.log("User registered successfully:", cleanReceipt);
        res.json({ success: true, receipt: cleanReceipt });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});


// ✅ Verify Login
app.post("/login", async (req, res) => {
    const { email, passwordHash, fingerprintHash } = req.body;

    try {
        const result = await contract.methods.verifyLogin(email, passwordHash, fingerprintHash).call();
        res.json({ success: result });
    } catch (error) {
        console.error("Login verification failed:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Get Fingerprint Hash
app.get("/fingerprint/:address", async (req, res) => {
    const userAddress = req.params.address;

    try {
        const fingerprintHash = await contract.methods.getFingerprintHash(userAddress).call();
        res.json({ success: true, fingerprintHash });
    } catch (error) {
        console.error("Failed to fetch fingerprint hash:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});