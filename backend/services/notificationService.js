const nodemailer = require("nodemailer");

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function sendEmail(to, subject, html) {
  if (!to) {
    console.log("⚠️ ไม่มี Email ผู้รับ");
    return;
  }

  try {
    await emailTransporter.sendMail({
      from: `"ระบบจองห้องประชุม" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", to);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}

module.exports = {
  sendEmail,
};