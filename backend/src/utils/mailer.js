const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Sends an email. In local/dev environments without SMTP credentials configured,
 * this logs the message instead of throwing, so the rest of the app keeps working.
 */
async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[mailer:dev] Would send email to ${to} | Subject: ${subject}`);
    return { simulated: true };
  }

  return getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'Spreetail HR <no-reply@spreetail.com>',
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
