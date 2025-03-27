## **Blockchain Powered Zero-Trust Identity Verification System (Cloud-Based) - Documentation**  

## **Overview**  
This project is a **Cloud-Based Blockchain Powered Zero-Trust Identity Verification System** built on **Local Ethereum Blockchain -- Ganache** and hosted on **AWS**. It integrates **Device Biomentric authentication (Device fingerprint hashing)** and **OTP verification** for a highly secure, decentralized identity system.  

## **Tech Stack**  
- **Cloud Platform:** AWS  
- **Backend:** Node.js, Express.js (Deployed on AWS EC2)  
- **Blockchain:** Solidity (Smart Contracts on Ethereum), Web3.js  
- **Database:** AWS DynamoDB (For user metadata) & Ethereum Blockchain (Decentralized Storage)  
- **Authentication:** Fingerprint Hashing, OTP via AWS SES  
- **Frontend:** React.js (Hosted on AWS S3 + CloudFront)  
- **Testing:** Ganache (Ethereum Test Blockchain)  

---

## **AWS Cloud Architecture**  
### 🌐 **Services Used**  
- **AWS EC2:** Hosts the backend server (Node.js + Express.js).  
- **AWS DynamoDB:** Stores user metadata (email, registration timestamps).  
- **AWS Lambda:** Handles OTP generation & email verification.  
- **AWS SES (Simple Email Service):** Sends OTP emails for authentication.  
- **AWS S3 + CloudFront:** Hosts the frontend React application.  
- **AWS Cognito (Optional):** Can be used for user identity management.  
- **Ethereum Blockchain:** Stores user authentication data securely.  

---

## **Features**  
### 🔐 **User Registration (Cloud & Blockchain)**  
- Users register with **email, password, and fingerprint hash**.  
- OTP verification via **AWS SES** before storing data.  
- User metadata is stored in **AWS DynamoDB**, while authentication data is on **Ethereum Blockchain**.  

### 🔑 **Login & Authentication**  
- Users authenticate using **email, password, and fingerprint hash**.  
- The system verifies credentials **using AWS Lambda & DynamoDB**.  
- If fingerprint hash mismatches, login is denied (**Zero-Trust Model**).  

### 🔄 **Fingerprint Update**  
- Users can update their fingerprint hash after a **24-hour cooldown**.  
- Transaction is recorded **on the blockchain**.  

### 📜 **Blockchain Integration**  
- **Solidity Smart Contract** stores authentication data securely.  
- **Web3.js handles transactions** between the cloud backend and Ethereum.  
- Each user is assigned a **unique blockchain address** for authentication.  

---

## **Project Structure**  
```
/blockchain-zero-trust
│── /backend
│   │── server.js           # Express Server & Blockchain Integration (Deployed on EC2)
│   │── web3.js             # Web3 Configuration (Ethereum + AWS)
│   │── otp.js              # AWS Lambda for OTP Verification
│   │── db.js               # AWS DynamoDB Integration
│   │── .env                # Environment Variables (AWS & Blockchain Config)
│── /smart-contracts
│   │── IdentityVerification.sol  # Solidity Smart Contract
│── /frontend
│   │── React-App           # React.js App Hosted on AWS S3 + CloudFront
│── README.md               # Project Documentation
│── package.json            # Node.js Dependencies
```

---

## **How It Works (Cloud-Based)**  
### 1️⃣ **User Registration**  
1. User enters **email, password, and fingerprint hash**.  
2. **AWS Lambda** triggers OTP generation & sends via **AWS SES**.  
3. Once verified, metadata is **stored in DynamoDB** and authentication data in **Ethereum Blockchain**.  

### 2️⃣ **User Login**  
1. User enters **email, password, and fingerprint**.  
2. System **fetches user metadata from DynamoDB**.  
3. **AWS Lambda calls Web3.js** to validate blockchain-stored fingerprint hash.  
4. If matched, access is granted.  

### 3️⃣ **Fingerprint Update**  
1. User requests **fingerprint change** (after 24-hour cooldown).  
2. **AWS Lambda verifies email & password** before update.  
3. New fingerprint hash is **stored on the blockchain**.  

---

## **Solidity Smart Contract (IdentityVerification.sol)**  
### **Functions Implemented:**  
✔ **registerUser(email, password, fingerprint)** → Registers a new user.  
✔ **verifyLogin(email, password, fingerprint)** → Authenticates user login.  
✔ **updateFingerprint(email, newFingerprint)** → Updates fingerprint with cooldown.  
✔ **getUserByEmail(email)** → Retrieves user details.  

---

## **Deployment on AWS**  
### **1️⃣ Deploy Backend on AWS EC2**  
```sh
scp -i "key.pem" backend/* ubuntu@ec2-instance:/home/ubuntu
ssh -i "key.pem" ubuntu@ec2-instance
npm install
node server.js
```

### **2️⃣ Set Up AWS DynamoDB**  
- Create a **DynamoDB table** with `email` as the primary key.  
- Store user metadata (email, registration timestamp).  

### **3️⃣ Deploy Smart Contract on Ethereum**  
```sh
truffle migrate --reset --network aws
```

### **4️⃣ Deploy React Frontend on AWS S3**  
```sh
aws s3 sync ./frontend/build s3://your-bucket-name
```
- Enable **CloudFront** for faster content delivery.  

---

## **Security Considerations**  
✅ **AWS IAM Policies:** Secure access control for AWS services.  
✅ **Zero-Trust Model:** No inherent trust, every authentication is verified.  
✅ **Blockchain Storage:** Prevents data tampering.  
✅ **AWS SES Verified Emails:** Ensures OTPs are sent securely.  

---

## **Future Improvements**  
✅ **AWS KMS Integration** for additional data encryption.  
✅ **Multi-Region Deployment** for scalability.  
✅ **Smart Contract Upgradeability** for improved security.  

---
🚀 **Powered By:** AWS, Ethereum, Web3.js, and Zero-Trust Security Model  
