// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract IdentityVerification {
    struct User {
        string email;
        bytes32 passwordHash;
        bytes32 fingerprintHash;
        uint256 lastUpdateTimestamp; // Cooldown timer for fingerprint updates
    }

    mapping(address => User[]) private users;
    mapping(bytes32 => address) private emailToAddress;

    event UserRegistered(address indexed user, string email);
    event LoginAttempt(address indexed user, bool success, string message);
    event FingerprintUpdated(address indexed user, string email);

    /**
     * 📌 Register a New User
     */
    function registerUser(
        string memory email,
        string memory password,
        string memory fingerprint
    ) public {
        bytes32 emailHash = keccak256(abi.encodePacked(email));

        require(emailToAddress[emailHash] == address(0), "[ERROR] Email already in use!");

        users[msg.sender].push(
            User(
                email,
                keccak256(abi.encodePacked(password)),
                keccak256(abi.encodePacked(fingerprint)),
                block.timestamp
            )
        );
        emailToAddress[emailHash] = msg.sender;

        emit UserRegistered(msg.sender, email);
    }

    /**
     * 📌 Verify Login (Requires Password & Fingerprint)
     */
    function verifyLogin(
        string memory email,
        string memory password,
        string memory fingerprint
    ) public view returns (bool, string memory) {
        bytes32 emailHash = keccak256(abi.encodePacked(email));
        address userAddress = emailToAddress[emailHash];

        if (userAddress == address(0)) {
            return (false, "[ERROR] User not found!");
        }

        User[] memory userList = users[userAddress];

        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(abi.encodePacked(password)) == userList[i].passwordHash) {
                if (keccak256(abi.encodePacked(fingerprint)) == userList[i].fingerprintHash) {
                    return (true, "[SUCCESS] Login successful!");
                } else {
                    return (false, "[SECURITY ALERT] Invalid Authentication Attempt: Device Integrity is not matching!");
                }
            }
        }

        return (false, "[SECURITY ALERT] Invalid Authentication Attempt: Wrong Credentials!");
    }

    /**
    * 📌 Get Blockchain Address by Email
    */
    function getAddressByEmail(string memory email) public view returns (address) {
        bytes32 emailHash = keccak256(abi.encodePacked(email));
        return emailToAddress[emailHash];
    }


    /**
     * 📌 Update Fingerprint (Requires Cooldown Period)
     */
    function updateFingerprint(string memory email, string memory newFingerprint) public {
        bytes32 emailHash = keccak256(abi.encodePacked(email));
        address userAddress = emailToAddress[emailHash];

        require(userAddress == msg.sender, "[ERROR] Unauthorized user!");

        User[] storage userList = users[userAddress];

        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked(userList[i].email))) {
                require(block.timestamp - userList[i].lastUpdateTimestamp > 24 hours, "[WARNING] Update cooldown active!");

                userList[i].fingerprintHash = keccak256(abi.encodePacked(newFingerprint));
                userList[i].lastUpdateTimestamp = block.timestamp;

                emit FingerprintUpdated(msg.sender, email);
                return;
            }
        }

        revert("[ERROR] User not found!");
    }

    /**
     * 📌 Get Users by Address
     */
    function getUsersByAddress(address userAddress) public view returns (User[] memory) {
        require(users[userAddress].length > 0, "[ERROR] No users found for this address!");
        return users[userAddress];
    }

    /**
     * 📌 Get User by Email
     */
    function getUserByEmail(string memory email) public view returns (string memory, bytes32, bytes32) {
        address userAddress = emailToAddress[keccak256(abi.encodePacked(email))];
        require(userAddress != address(0), "[ERROR] User not found!");

        User[] memory userList = users[userAddress];
        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked(userList[i].email))) {
                return (userList[i].email, userList[i].passwordHash, userList[i].fingerprintHash);
            }
        }

        revert("[ERROR] User not found!");
    }
}
