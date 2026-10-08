// =====================================================================================
// Real SMTP email sending via Gmail (nodemailer), used for the Admin login OTP.
// Requires NODEMAILER_EMAIL (the Gmail address) and NODEMAILER_PASS (a Gmail App
// Password — not the account's normal login password; generate one at
// myaccount.google.com/apppasswords with 2-Step Verification turned on).
// =====================================================================================
import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  return transporter;
}

export async function sendOtpEmail(toEmail, otp) {
  const t = getTransporter();
  await t.sendMail({
    from: `"Niryana Jewels Admin" <${process.env.NODEMAILER_EMAIL}>`,
    to: toEmail,
    subject: `${otp} is your Niryana Jewels admin login code`,
    text: `Your admin login verification code is ${otp}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 420px; margin: 0 auto; padding: 32px 24px; background: #FAF7F0; border-radius: 16px;">
        <p style="color:#C9A86A; letter-spacing: 2px; font-size: 11px; text-transform: uppercase; margin: 0 0 8px;">Niryana Jewels — Admin Login</p>
        <h1 style="color:#1F3D32; font-size: 22px; margin: 0 0 16px;">Your verification code</h1>
        <p style="color:#3A3A3A; font-size: 14px; margin: 0 0 20px;">Enter this code to finish signing in to the admin dashboard:</p>
        <p style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color:#1F3D32; background: #fff; padding: 16px 20px; border-radius: 10px; text-align:center; margin: 0 0 20px;">${otp}</p>
        <p style="color:#777; font-size: 12px; margin: 0;">This code expires in 10 minutes. If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
