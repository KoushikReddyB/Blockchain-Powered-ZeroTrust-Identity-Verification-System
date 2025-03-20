const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587, // Ensure it's a number
    secure: false, // ✅ `false` for TLS (port 587), `true` for SSL (port 465)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // ⚠️ Use an App Password, not your Gmail password
    },
    tls: {
        ciphers: "SSLv3", // ✅ Prevents unexpected connection closures
        rejectUnauthorized: false, // ✅ Fixes TLS-related errors
    },
    connectionTimeout: 10000, // ✅ Avoids connection timeout errors
});

// ✅ Verify SMTP Connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed:", error);
    } else {
        console.log("✅ SMTP Server is Ready to Send Emails!");
    }
});

// 📌 Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 📩 Send OTP Email (With Retry)
async function sendOTP(email, otp, retries = 1) {
    const mailOptions = {
        from: `"Security Team" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP sent successfully to ${email}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send OTP to ${email}`);
        console.error("📌 Detailed Error:", error);

        if (retries > 0) {
            console.log(`🔄 Retrying to send OTP... (${2 - retries} attempt left)`);
            return sendOTP(email, otp, retries - 1);
        }

        return false;
    }
}

module.exports = { generateOTP, sendOTP };
