const IdentityVerification = artifacts.require('IdentityVerification');

contract('IdentityVerification', (accounts) => {
    let identityVerification;
    let userAddress;
    let fingerprint;

    before(async () => {
        identityVerification = await IdentityVerification.deployed();
        userAddress = accounts[1]; // Use a different account than the deployer
        fingerprint = 'test_fingerprint_123';
    });

    it('should register a user with a fingerprint', async () => {
        await identityVerification.registerUser(fingerprint, { from: userAddress });
        const storedFingerprint = await identityVerification.getFingerprint(userAddress);
        assert.equal(storedFingerprint, fingerprint, 'Fingerprints should match');
    });

    it('should verify a valid fingerprint', async () => {
        const isValid = await identityVerification.verifyFingerprint(userAddress, fingerprint);
        assert.equal(isValid, true, 'Fingerprint should be valid');
    });

    it('should not verify an invalid fingerprint', async () => {
        const invalidFingerprint = 'invalid_fingerprint_456';
        const isValid = await identityVerification.verifyFingerprint(userAddress, invalidFingerprint);
        assert.equal(isValid, false, 'Fingerprint should be invalid');
    });
});