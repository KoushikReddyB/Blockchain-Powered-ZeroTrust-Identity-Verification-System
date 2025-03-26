const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || "Users";

exports.handler = async (event) => {
    const { email, passwordHash, fingerprintHash } = JSON.parse(event.body);

    console.log(`[INFO] Login attempt for: ${email}`);

    const params = {
        TableName: USERS_TABLE,
        Key: { email },
    };

    try {
        const { Item } = await dynamoDB.get(params).promise();
        if (!Item) {
            console.log(`[ERROR] User not found: ${email}`);
            return { statusCode: 404, body: JSON.stringify({ success: false, message: "User not found!" }) };
        }

        // Verify Password
        if (passwordHash !== Item.passwordHash) {
            console.log(`[SECURITY ALERT] Wrong password attempt for ${email}`);
            return { statusCode: 401, body: JSON.stringify({ success: false, message: "Invalid credentials!" }) };
        }

        // Verify Fingerprint
        if (fingerprintHash !== Item.fingerprintHash) {
            console.log(`[SECURITY ALERT] Fingerprint mismatch for ${email}`);
            return { statusCode: 401, body: JSON.stringify({ success: false, message: "Device mismatch!" }) };
        }

        // Generate JWT Token
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log(`[SUCCESS] Login successful for: ${email}`);
        return { statusCode: 200, body: JSON.stringify({ success: true, token }) };

    } catch (error) {
        console.log(`[ERROR] Login error: ${error.message}`);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Login failed!" }) };
    }
};
