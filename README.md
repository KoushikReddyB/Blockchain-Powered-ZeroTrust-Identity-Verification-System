# 🔐 Blockchain Powered Zero-Trust Identity Verification System (Cloud-Based) — Documentation

---

## 📌 Overview

This project is a **Cloud-Based, Blockchain-Powered Zero-Trust Identity Verification System** designed to provide decentralized and tamper-proof identity authentication using **biometric fingerprint hashing** and **OTP-based email verification**.

It leverages a **local Ethereum blockchain** (via **Ganache**), **Solidity smart contracts**, and an **AWS-integrated infrastructure** including **EC2**, **S3**, **CloudFront**, **AWS SES**, **Amplify CLI**, and **AWS CLI**. The frontend is built with **React**, while the backend is powered by **Node.js + Express.js**, hosted on a cloud VM (**AWS EC2**). This architecture ensures **security**, **scalability**, and **modularity**, while strictly following a **Zero-Trust Security Model**.

---

## 🧱 Tech Stack

| Layer               | Technology Used                               |
|--------------------|------------------------------------------------|
| **Cloud Platform** | AWS                                            |
| **Frontend**       | React.js (Hosted on S3 + CloudFront via Amplify) |
| **Backend**        | Node.js + Express.js (Deployed on EC2)         |
| **Blockchain**     | Solidity (Smart Contracts), Ganache, Web3.js   |
| **Authentication** | Fingerprint Hashing + OTP (via AWS SES)        |
| **DevOps/Infra**   | Amplify CLI, AWS CLI, Git                      |

---

## 🌐 AWS Cloud Architecture

### ✅ Cloud Services Used

| AWS Service           | Role                                                                 |
|-----------------------|----------------------------------------------------------------------|
| **EC2**               | Hosts backend server (Node.js + Express.js)                          |
| **SES (Simple Email Service)** | Sends OTP verification emails for authentication                |
| **S3**                | Stores and serves the React frontend                                 |
| **CloudFront**        | Distributes frontend globally with low latency and HTTPS support     |
| **Amplify CLI**       | Manages frontend deployment and hosting infrastructure (S3 + CloudFront) |
| **AWS CLI**           | Used to configure and automate deployment (S3 sync, IAM, EC2 setup)  |

> **Note:** Services like **Lambda**, **Cognito**, and **DynamoDB** were considered but not used due to setup constraints.

---

## 🚀 Features

### 🔐 User Registration (Cloud + Blockchain)
- Users register with **email**, **password**, and **device fingerprint hash**
- **OTP sent via AWS SES** for identity verification
- Upon verification:
  - Data stored in backend memory (future upgrade: persistent DB)
  - Identity hash recorded immutably on **Ethereum Blockchain**

### 🔑 User Login (Decentralized + Zero Trust)
- Login requires **email**, **password**, and **fingerprint hash**
- System performs:
  - Server-side credential validation
  - Blockchain verification of fingerprint hash using **Web3.js**
- If any mismatch occurs, login is denied — **Zero Trust enforced**

### 🔁 Fingerprint Update (With Cooldown)
- Users can request to update fingerprint hash (after 24-hour cooldown)
- Backend validates user and updates the smart contract on the blockchain

### 📜 Blockchain Integration
- Smart contract (`IdentityVerification.sol`) stores immutable user records
- Web3.js facilitates blockchain communication from Node.js backend
- Each user is assigned a unique blockchain identity

---

## 🧾 Project Structure

```
/blockchain-zero-trust
├── backend/
│   ├── server.js         # Express.js server with blockchain logic
│   ├── web3.js           # Web3 config for Ethereum connectivity
│   ├── otp.js            # OTP logic using AWS SES
│   └── .env              # Environment variables (SES keys, RPC URL, etc.)
│
├── smart-contracts/
│   └── IdentityVerification.sol  # Solidity smart contract (User registry)
│
├── frontend/
│   └── React-App/        # React app (deployed via Amplify CLI to S3)
│
├── amplify/              # Amplify CLI config for hosting
├── README.md             # Project documentation
├── package.json          # Node.js dependencies
└── truffle-config.js     # Blockchain network setup
```

---

## 🔍 How It Works (End-to-End)

### 1️⃣ User Registration
- User fills registration form (email, password, fingerprint hash)
- AWS SES sends OTP to email address
- On correct OTP input:
  - Backend stores minimal user info
  - Blockchain stores password & fingerprint hash immutably via smart contract

### 2️⃣ Login Authentication
- User submits email, password, and fingerprint hash
- Server validates locally stored email/password
- Blockchain queried to match fingerprint hash via Web3
- If match → user authenticated; else → login denied (Zero Trust)

### 3️⃣ Fingerprint Update Flow
- User logs in and requests fingerprint update
- Backend enforces **24-hour cooldown**
- Once validated, new fingerprint hash written to blockchain

---

## 💡 Smart Contract: `IdentityVerification.sol`

### ✅ Functions Implemented:
```solidity
registerUser(email, password, fingerprint)
verifyLogin(email, password, fingerprint)
updateFingerprint(email, newFingerprint)
getUserByEmail(email)
```

> Blockchain guarantees data integrity and auditability for all identity operations.

---

## ⚙️ Deployment Guide

### 🔨 1. Deploy Smart Contract
```bash
cd smart-contracts
truffle migrate --reset --network development
```

### ☁️ 2. Deploy Backend to EC2
```bash
# Copy backend to EC2
scp -i "key.pem" -r backend/* ubuntu@<EC2-IP>:/home/ubuntu
# SSH and run
ssh -i "key.pem" ubuntu@<EC2-IP>
cd /home/ubuntu
npm install
node server.js
```

### 📬 3. Configure AWS SES
- Go to AWS SES Console → Verify sender email
- Add access credentials to `.env`
```
AWS_SES_ACCESS_KEY=xxxx
AWS_SES_SECRET_KEY=xxxx
SES_EMAIL_FROM=verified@example.com
```

### 🌐 4. Deploy Frontend with Amplify CLI
```bash
cd frontend/React-App
npm run build
amplify init
amplify add hosting
amplify publish
```

> Amplify CLI configures hosting via S3 & CloudFront automatically.

---

## 🛡️ Security Considerations

✅ **Zero Trust Architecture**: No session or persistent trust—every action is verified  
✅ **Blockchain Integrity**: Tamper-proof smart contract-based identity storage  
✅ **SES Email Verification**: Adds an external identity check  
✅ **Cooldown Logic**: Prevents abuse of sensitive actions  
✅ **.env Management**: All AWS keys and RPC URLs stored securely in environment variables

---

## 🔮 Future Improvements

| Feature                        | Status       |
|-------------------------------|--------------|
| AWS Cognito (OAuth/AuthPool)  | 🔜 Planned    |
| AWS Lambda OTP Handler        | 🔜 Planned    |
| DynamoDB for persistent storage | 🔜 Planned    |
| AWS KMS for encrypted storage | 🔜 Planned    |
| Multi-region Deployment       | 🔜 Planned    |
| CI/CD via GitHub + Amplify    | ✅ In Scope   |

---

## 🧠 Conclusion

This system showcases a **modern, decentralized, zero-trust identity platform** with full integration of **Ethereum blockchain**, **AWS Cloud services**, and **email-based OTP** using **SES**. It’s a secure, flexible, and scalable foundation for real-world identity applications—whether in fintech, healthcare, or enterprise systems.

---

## 🚀 Built With

- **Solidity** (Smart Contracts)  
- **React.js** (Frontend)  
- **Node.js + Express.js** (Backend)  
- **Web3.js** (Blockchain Communication)  
- **Ganache** (Ethereum Testnet)  
- **AWS EC2, SES, S3, CloudFront**  
- **Amplify CLI & AWS CLI** for deployment and infrastructure

