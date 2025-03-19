const IdentityVerification = artifacts.require("IdentityVerification");

contract("IdentityVerification", (accounts) => {
    let contractInstance;
    
    // Test data
    const testEmail = "user@example.com";
    const testPassword = "securePassword";
    const testFingerprint = "fingerprint123";
    const wrongPassword = "wrongPassword";
    const wrongFingerprint = "wrongFingerprint";

    before(async () => {
        contractInstance = await IdentityVerification.deployed();
    });

    it("✅ Should deploy the contract successfully", async () => {
        assert(contractInstance.address !== "", "Contract address is empty");
    });

    it("✅ Should register a new user", async () => {
        const tx = await contractInstance.registerUser(testEmail, testPassword, testFingerprint, { from: accounts[1] });
        assert(tx.receipt.status, "User registration failed");
    });

    it("❌ Should not allow duplicate registration", async () => {
        try {
            await contractInstance.registerUser(testEmail, testPassword, testFingerprint, { from: accounts[1] });
            assert.fail("Duplicate registration should fail");
        } catch (error) {
            assert(error.message.includes("User already registered!"), "Unexpected error message");
        }
    });

    it("✅ Should verify login with correct credentials", async () => {
        const isValid = await contractInstance.verifyLogin(testEmail, testPassword, testFingerprint);
        assert.equal(isValid, true, "Login should succeed with correct credentials");
    });

    it("❌ Should fail login with incorrect credentials", async () => {
        const isValid = await contractInstance.verifyLogin(testEmail, wrongPassword, testFingerprint);
        assert.equal(isValid, false, "Login should fail with incorrect password");
    });

    it("✅ Should fetch user details by email", async () => {
        const userDetails = await contractInstance.getUserByEmail(testEmail);
        assert.equal(userDetails[0], testEmail, "Email mismatch");
    });

    it("✅ Should update fingerprint", async () => {
        const newFingerprint = "newFingerprint456";
        const tx = await contractInstance.updateFingerprint(testEmail, testPassword, newFingerprint, { from: accounts[1] });
        assert(tx.receipt.status, "Fingerprint update failed");

        const isUpdated = await contractInstance.verifyLogin(testEmail, testPassword, newFingerprint);
        assert.equal(isUpdated, true, "Fingerprint update validation failed");
    });

    it("❌ Should not update fingerprint with incorrect password", async () => {
        try {
            await contractInstance.updateFingerprint(testEmail, wrongPassword, "anotherFingerprint", { from: accounts[1] });
            assert.fail("Fingerprint update should fail with incorrect password");
        } catch (error) {
            assert(error.message.includes("Incorrect password!"), "Unexpected error message");
        }
    });
});
