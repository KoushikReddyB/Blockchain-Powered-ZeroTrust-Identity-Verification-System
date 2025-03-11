pragma solidity ^0.8.0;

contract IdentityVerification {
    struct User {
        string email;
        string passwordHash;
        string fingerprintHash; // Renamed to fingerprintHash
    }

    mapping(address => User) public users;

    event UserRegistered(address user, string email, string passwordHash, string fingerprintHash);

    function registerUser(string memory email, string memory passwordHash, string memory fingerprintHash) public {
    require(bytes(users[msg.sender].email).length == 0, "User already registered!"); // Prevent overwriting
    users[msg.sender] = User(email, passwordHash, fingerprintHash);
    emit UserRegistered(msg.sender, email, passwordHash, fingerprintHash);
}


    function verifyLogin(string memory email, string memory passwordHash, string memory fingerprintHash) public view returns (bool) {
        User storage user = users[msg.sender];
        return keccak256(bytes(user.email)) == keccak256(bytes(email)) && keccak256(bytes(user.passwordHash)) == keccak256(bytes(passwordHash)) && keccak256(bytes(user.fingerprintHash)) == keccak256(bytes(fingerprintHash));
    }

    function getFingerprintHash(address userAddress) public view returns (string memory) {
        return users[userAddress].fingerprintHash;
    }
}