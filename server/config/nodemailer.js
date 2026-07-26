import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.EMAIL_ALLOW_SELF_SIGNED !== 'true',
  },
});

/**
 * Sends a 6-digit OTP verification email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} userName - Optional user name
 */
export const sendOtpEmail = async (toEmail, otpCode, userName = 'Customer') => {
  const mailOptions = {
    from: process.env.MAIL_FROM || `"Janki Jiyana House" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `🔑 ${otpCode} is your OTP Verification Code - Janki Jiyana House`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">Janki Jiyana House</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Baby Care & Personal Hygiene Essentials</p>
        </div>

        <div style="padding: 25px 10px; text-align: center;">
          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 10px;">Verification Code</h3>
          <p style="color: #475569; font-size: 14px; line-height: 1.5; margin-bottom: 25px;">
            Hello <strong>${userName}</strong>,<br/>
            Please use the following 6-digit OTP to verify your email address and complete your request.
          </p>

          <div style="background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; padding: 18px; border-radius: 16px; text-align: center; display: inline-block; min-width: 200px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.25);">
            ${otpCode}
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-top: 25px;">
            This OTP code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
          </p>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; color: #94a3b8; font-size: 11px;">
          <p style="margin: 0;">© Janki Jiyana House. 100% Discreet Packaging & Trusted Hygiene Care.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Nodemailer Email OTP sent to ${toEmail}. Message ID: ${info.messageId}`);
  return info;
};

export default transporter;
