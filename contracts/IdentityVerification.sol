// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract IdentityVerification {
    struct User {
        string email;
        bytes32 passwordHash;
        bytes32 fingerprintHash;
    }

    // 🔥 Change mapping to store multiple users under the same address
    mapping(address => User[]) private users;  // Now stores an array of users per address
    mapping(bytes32 => address) private emailToAddress; // Map email to an Ethereum address

    event UserRegistered(address indexed user, string email);
    event LoginAttempt(address indexed user, bool success);
    event FingerprintUpdated(address indexed user, string email);

    function registerUser(string memory email, string memory password, string memory fingerprint) public {
        bytes32 emailHash = keccak256(abi.encodePacked(email));

        // 🔥 Check if email is already in use
        require(emailToAddress[emailHash] == address(0), "Email already in use!");

        // 🔄 Append new user to the user's list
        users[msg.sender].push(User(email, keccak256(abi.encodePacked(password)), keccak256(abi.encodePacked(fingerprint))));
        emailToAddress[emailHash] = msg.sender;

        emit UserRegistered(msg.sender, email);
    }

    function verifyLogin(string memory email, string memory password, string memory fingerprint) 
        public 
        view 
        returns (bool, string memory) 
    {
        bytes32 emailHash = keccak256(abi.encodePacked(email));
        address userAddress = emailToAddress[emailHash];

        if (userAddress == address(0)) {
            return (false, "User not found!");
        }

        User[] memory userList = users[userAddress];

        for (uint i = 0; i < userList.length; i++) {
            if (
                keccak256(abi.encodePacked(password)) == userList[i].passwordHash &&
                keccak256(abi.encodePacked(fingerprint)) == userList[i].fingerprintHash
            ) {
                return (true, "Login successful!");
            }
        }

        return (false, "Invalid credentials!");
    }

    function getUsersByAddress(address userAddress) public view returns (User[] memory) {
        require(users[userAddress].length > 0, "No users found for this address!");
        return users[userAddress];
    }

    function getUserByEmail(string memory email) public view returns (string memory, bytes32, bytes32) {
        address userAddress = emailToAddress[keccak256(abi.encodePacked(email))];
        require(userAddress != address(0), "User not found!");

        User[] memory userList = users[userAddress];
        for (uint i = 0; i < userList.length; i++) {
            if (keccak256(abi.encodePacked(email)) == keccak256(abi.encodePacked(userList[i].email))) {
                return (userList[i].email, userList[i].passwordHash, userList[i].fingerprintHash);
            }
        }

        revert("User not found!");
    }
}
