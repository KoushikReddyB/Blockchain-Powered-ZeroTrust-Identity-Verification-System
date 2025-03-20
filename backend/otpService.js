const nodemailer = require("nodemailer");
require("dotenv").config();

let otpStore = {}; // Temporary OTP storage (Replace with Redis later)
let otpAttempts = {}; // Track OTP failures & blocking

// ✅ Configure SMTP (Make sure to use an App Password if using Gmail)
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
        console.log("✅ SMTP Server Ready!");
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
        console.log(`✅ OTP sent to ${email}`);

        // Store OTP temporarily
        otpStore[email] = { otp, timestamp: Date.now() };

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

// 🔄 Verify OTP with Attempt Tracking & Blocking
async function verifyOTP(email, otp) {
    if (!otpAttempts[email]) {
        otpAttempts[email] = { count: 0, blocked: false, blockTime: null };
    }

    const now = Date.now();

    // ⛔ If blocked, check if block duration has passed
    if (otpAttempts[email].blocked) {
        const timePassed = now - otpAttempts[email].blockTime;
        if (timePassed >= 5 * 60 * 1000) {
            // ✅ Unblock after 5 minutes
            otpAttempts[email] = { count: 0, blocked: false, blockTime: null };
        } else {
            console.log(`[BLOCKED] OTP verification still blocked for: ${email}`);
            return { success: false, error: "Too many failed attempts! Try again later." };
        }
    }

    const storedOtp = otpStore[email]?.otp;

    if (!storedOtp || storedOtp !== otp) {
        otpAttempts[email].count += 1;
        console.log(`[FAILED] OTP incorrect (${otpAttempts[email].count}/3) for: ${email}`);

        if (otpAttempts[email].count >= 3) {
            otpAttempts[email].blocked = true;
            otpAttempts[email].blockTime = now; // Save block start time
            console.log(`[BLOCKED] OTP verification blocked for: ${email}`);
            return { success: false, error: "Too many failed attempts! Try again later." };
        }

        return { success: false, error: `Incorrect OTP. ${3 - otpAttempts[email].count} attempts left.` };
    }

    // ✅ OTP is correct, reset attempts
    delete otpAttempts[email];
    delete otpStore[email];

    return { success: true };
}

module.exports = { generateOTP, sendOTP, verifyOTP, otpStore };