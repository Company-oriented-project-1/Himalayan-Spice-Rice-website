const nodemailer = require('nodemailer');

let transporterPromise;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = (async () => {
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    })();
  }

  return transporterPromise;
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

async function sendVerificationEmail(to, token) {
  const transporter = await getTransporter();
  const confirmUrl = `${getFrontendUrl()}/verify-email?token=${token}`;

  const info = await transporter.sendMail({
    from: 'Himalayan Spice & Rice <no-reply@himalayan-spice.local>',
    to,
    subject: 'Confirm your email',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Confirm your email address</h2>
        <p style="margin-top: 0;">Thanks for signing up. Please confirm your email to activate your account.</p>
        <a
          href="${confirmUrl}"
          style="display: inline-block; margin-top: 8px; background: #ea580c; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 600;"
        >
          Confirm Email
        </a>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          If the button does not work, copy and paste this URL into your browser:<br />
          ${confirmUrl}
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

async function sendPasswordResetEmail(to, token) {
  const transporter = await getTransporter();
  const resetUrl = `${getFrontendUrl()}/reset-password?token=${token}`;

  const info = await transporter.sendMail({
    from: 'Himalayan Spice & Rice <no-reply@himalayan-spice.local>',
    to,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
        <h2 style="margin-bottom: 8px;">Password reset request</h2>
        <p style="margin-top: 0;">We received a request to reset your password.</p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin-top: 8px; background: #991b1b; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-weight: 600;"
        >
          Reset Password
        </a>
        <p style="margin-top: 16px; font-size: 12px; color: #6b7280;">
          If you did not request this, you can ignore this email. This link expires in 1 hour.<br />
          ${resetUrl}
        </p>
      </div>
    `
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info)
  };
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
