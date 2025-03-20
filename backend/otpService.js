const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587, // Use 587 for better reliability
    secure: false, // `false` for TLS (587), `true` for SSL (465)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Use an App Password, NOT your regular Gmail password
    },
    tls: {
        rejectUnauthorized: false, // Prevent TLS errors
    },
});

// ✅ Debugging: Verify SMTP connection
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ SMTP Connection Failed:", error);
    } else {
        console.log("✅ SMTP Server is Ready to Send Emails!");
    }
});

// 📌 Function to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// 📩 Function to send OTP via email (with retry)
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

        // Retry logic for transient failures
        if (retries > 0) {
            console.log(`🔄 Retrying to send OTP... (${2 - retries} attempt left)`);
            return sendOTP(email, otp, retries - 1);
        }

        return false;
    }
}

module.exports = { generateOTP, sendOTP };
