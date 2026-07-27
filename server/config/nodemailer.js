import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465', 10),
  secure: process.env.SMTP_PORT === '465', // true for 465
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

/**
 * Sends order confirmation emails to both customer and admin.
 */
export const sendOrderConfirmationEmail = async (order, customerEmail, customerName = 'Customer') => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    const recipients = [customerEmail];
    if (adminEmail && adminEmail !== customerEmail) {
      recipients.push(adminEmail);
    }

    const itemsHtml = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; color: #334155; font-weight: bold;">${item.name}</td>
          <td style="padding: 10px 0; text-align: center; color: #64748b;">${item.quantity}</td>
          <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: bold;">₹${item.price * item.quantity}</td>
        </tr>
      `
      )
      .join('');

    const mailOptions = {
      from: process.env.MAIL_FROM || `"Support Janki Jiyana House" <${process.env.SMTP_USER}>`,
      to: recipients,
      subject: `🎉 Order Confirmed #${order._id.toString().slice(-8).toUpperCase()} - Janki Jiyana House`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 20px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
            <h2 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">Janki Jiyana House</h2>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Thank you for your order!</p>
          </div>

          <div style="padding: 20px 0;">
            <p style="color: #334155; font-size: 14px; margin-bottom: 15px;">
              Hello <strong>${customerName}</strong>,<br/>
              Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> has been successfully received and is being processed.
            </p>

            <div style="background-color: #f8fafc; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">Order Summary</h4>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="border-bottom: 1px solid #cbd5e1; text-align: left; color: #64748b;">
                    <th style="padding-bottom: 8px;">Item</th>
                    <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                    <th style="padding-bottom: 8px; text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="border-top: 2px solid #e2e8f0; margin-top: 15px; padding-top: 10px; text-align: right;">
                <span style="font-size: 16px; font-weight: 900; color: #0f172a;">Total Paid: ₹${order.totalAmount}</span>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #059669; font-weight: bold;">Payment Method: ${order.paymentMethod}</p>
              </div>
            </div>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 15px;">
              <h4 style="margin: 0 0 5px 0; color: #0f172a; font-size: 13px;">Shipping Address</h4>
              <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.4;">
                ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zipCode}<br/>
                Phone: ${order.shippingAddress.phone || 'N/A'}
              </p>
            </div>
          </div>

          <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; text-align: center; color: #94a3b8; font-size: 11px;">
            <p style="margin: 0;">100% Plain Unbranded Box Delivery Guaranteed.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${recipients.join(', ')}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
  }
};

export default transporter;
