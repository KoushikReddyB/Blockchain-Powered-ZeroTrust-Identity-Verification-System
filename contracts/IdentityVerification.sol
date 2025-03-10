pragma solidity ^0.8.0;

contract IdentityVerification {
    mapping(address => string) public userFingerprints;

    function registerUser(string memory fingerprint) public {
        userFingerprints[msg.sender] = fingerprint;
    }

    function verifyFingerprint(address userAddress, string memory fingerprint) public view returns (bool) {
        return keccak256(bytes(userFingerprints[userAddress])) == keccak256(bytes(fingerprint));
    }

    function getFingerprint(address userAddress) public view returns (string memory){
        return userFingerprints[userAddress];
    }
}