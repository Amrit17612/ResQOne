import axios from 'axios';
import nodemailer from 'nodemailer';

let testAccount = null;
let transporter = null;

export const sendSecurityEmail = async ({ to, subject, html, text }) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SMTP_USER || 'amrit17612@gmail.com';

  // 1. Primary High-Reliability Provider: Brevo HTTPS REST API (Port 443 - Never Blocked by Cloud)
  if (brevoApiKey) {
    try {
      console.log(`[ResQOne Mailer] Dispatching email via Brevo REST API to: ${to}...`);
      const response = await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: 'ResQOne Emergency Grid', email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html || `<p>${text}</p>`,
          textContent: text || ''
        },
        {
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`[ResQOne Mailer] ✅ Email successfully delivered to ${to} via Brevo! (MessageId: ${response.data.messageId})`);
      return { success: true, messageId: response.data.messageId };
    } catch (brevoErr) {
      console.error('[ResQOne Mailer] ⚠️ Brevo API error, falling back to SMTP:', brevoErr.response?.data || brevoErr.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const mailer = await getMailTransporter();
    console.log(`[ResQOne Mailer] Dispatching email via SMTP fallback to: ${to}...`);
    const info = await mailer.sendMail({
      from: `"ResQOne Security Grid" <${senderEmail}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`[ResQOne Mailer] ✅ Email delivered via SMTP to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[ResQOne Mailer] ❌ Email send error to ${to}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

export const getMailTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  return transporter;
};


