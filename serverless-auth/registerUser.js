const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || "Users";

exports.handler = async (event) => {
    const { email, passwordHash, fingerprintHash } = JSON.parse(event.body);

    console.log(`[INFO] Received registration request for: ${email}`);

    // Check if user exists
    const params = {
        TableName: USERS_TABLE,
        Key: { email },
    };

    try {
        const { Item } = await dynamoDB.get(params).promise();
        if (Item) {
            console.log(`[ERROR] Email already registered: ${email}`);
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: "Email already in use!" }),
            };
        }
    } catch (error) {
        console.log(`[ERROR] Database error: ${error.message}`);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Database error" }) };
    }

    // Store new user
    const userParams = {
        TableName: USERS_TABLE,
        Item: { email, passwordHash, fingerprintHash },
    };

    try {
        await dynamoDB.put(userParams).promise();
        console.log(`[SUCCESS] User registered successfully: ${email}`);
        return { statusCode: 200, body: JSON.stringify({ success: true, message: "User registered!" }) };
    } catch (error) {
        console.log(`[ERROR] Failed to store user: ${error.message}`);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Registration failed" }) };
    }
};
