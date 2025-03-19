// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract IdentityVerification {
    struct User {
        string email;
        bytes32 passwordHash;
        bytes32 fingerprintHash;
    }

    mapping(address => User) private users;
    mapping(bytes32 => address) private emailToAddress; // 🔥 Use `bytes32` instead of `string`

    event UserRegistered(address indexed user, string email);
    event LoginAttempt(address indexed user, bool success);
    event FingerprintUpdated(address indexed user, string email);

    function registerUser(string memory email, string memory password, string memory fingerprint) public {
        bytes32 emailHash = keccak256(abi.encodePacked(email));

        require(bytes(users[msg.sender].email).length == 0, "User already registered!");
        require(emailToAddress[emailHash] == address(0), "Email already in use!");

        users[msg.sender] = User(email, keccak256(abi.encodePacked(password)), keccak256(abi.encodePacked(fingerprint)));
        emailToAddress[emailHash] = msg.sender;

        emit UserRegistered(msg.sender, email);
    }

    function verifyLogin(string memory email, string memory password, string memory fingerprint) public view returns (bool) {
    address userAddress = emailToAddress[keccak256(abi.encodePacked(email))];
    require(userAddress != address(0), "User not found!");

    User memory user = users[userAddress];

    return (keccak256(abi.encodePacked(password)) == user.passwordHash &&
            keccak256(abi.encodePacked(fingerprint)) == user.fingerprintHash);
}


    function getUserByEmail(string memory email) public view returns (string memory, bytes32, bytes32) {
        address userAddress = emailToAddress[keccak256(abi.encodePacked(email))];
        require(userAddress != address(0), "User not found!");

        User memory user = users[userAddress];
        return (user.email, user.passwordHash, user.fingerprintHash);
    }

    function getUser(address userAddress) public view returns (string memory, bytes32, bytes32) {
        require(bytes(users[userAddress].email).length > 0, "User not found!");
        User memory user = users[userAddress];
        return (user.email, user.passwordHash, user.fingerprintHash);
    }

    function updateFingerprint(string memory email, string memory password, string memory newFingerprint) public {
        address userAddress = emailToAddress[keccak256(abi.encodePacked(email))];
        require(userAddress == msg.sender, "Unauthorized action!");

        User storage user = users[msg.sender];
        require(keccak256(abi.encodePacked(password)) == user.passwordHash, "Incorrect password!");


        user.fingerprintHash = keccak256(abi.encodePacked(newFingerprint));

        emit FingerprintUpdated(msg.sender, email);
    }
}
