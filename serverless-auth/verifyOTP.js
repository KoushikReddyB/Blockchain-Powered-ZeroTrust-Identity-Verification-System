const AWS = require("aws-sdk");

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = process.env.USERS_TABLE || "Users";

exports.handler = async (event) => {
    const { email, otp } = JSON.parse(event.body);

    console.log(`[INFO] OTP verification request for: ${email}`);

    const params = {
        TableName: USERS_TABLE,
        Key: { email },
    };

    try {
        const { Item } = await dynamoDB.get(params).promise();
        if (!Item || Item.otp !== otp) {
            console.log(`[ERROR] OTP verification failed for ${email}`);
            return { statusCode: 400, body: JSON.stringify({ success: false, message: "Invalid OTP" }) };
        }

        console.log(`[SUCCESS] OTP verified for: ${email}`);
        return { statusCode: 200, body: JSON.stringify({ success: true, message: "OTP verified!" }) };

    } catch (error) {
        console.log(`[ERROR] OTP verification error: ${error.message}`);
        return { statusCode: 500, body: JSON.stringify({ success: false, message: "Verification failed!" }) };
    }
};
