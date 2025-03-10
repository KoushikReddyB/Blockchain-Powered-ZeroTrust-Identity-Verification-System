require('dotenv').config();
const express = require('express');
const { Web3 } = require('web3');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const web3 = new Web3('http://127.0.0.1:7545'); // Ganache RPC URL
const contractAddress = process.env.CONTRACT_ADDRESS; // Access from .env
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "userFingerprints",
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
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "fingerprint",
                "type": "string"
            }
        ],
        "name": "registerUser",
        "outputs":[],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "userAddress",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "fingerprint",
                "type": "string"
            }
        ],
        "name": "verifyFingerprint",
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
        "name": "getFingerprint",
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

const contract = new web3.eth.Contract(contractABI, contractAddress);

app.post('/register', async (req, res) => {
    const { fingerprint } = req.body;
    const accounts = await web3.eth.getAccounts();
    try {
        await contract.methods.registerUser(fingerprint).send({ from: accounts[1] }); //register using account 1.
        res.json({ success: true, userAddress: accounts[1] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/verify', async (req, res) => {
    const { fingerprint } = req.body;
    const accounts = await web3.eth.getAccounts();
    try {
        const isValid = await contract.methods.verifyFingerprint(accounts[1], fingerprint).call(); //verify using account 1.
        res.json({ isValid, userAddress: accounts[1] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/fingerprint/:address', async (req, res) => {
    const { address } = req.params;
    try {
        const fingerprint = await contract.methods.getFingerprint(address).call();
        res.json({fingerprint});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});