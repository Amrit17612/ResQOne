import nodemailer from 'nodemailer';

let testAccount = null;
let transporter = null;

export const getMailTransporter = async () => {
  if (transporter) return transporter;

  // Use configured SMTP if present, otherwise Ethereal for testing
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Instant test account
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
    console.log(`[ResQOne Mailer] Ethereal Test Mailbox established: ${testAccount.user}`);
  }

  return transporter;
};

export const sendSecurityEmail = async ({ to, subject, html, text }) => {
  try {
    const mailer = await getMailTransporter();
    const info = await mailer.sendMail({
      from: `"ResQOne Security Grid" <${process.env.SMTP_FROM || 'security@resqone.org'}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`[ResQOne Mailer] Email sent to ${to} (MessageId: ${info.messageId})`);
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`[ResQOne Mailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
  } catch (err) {
    console.error('[ResQOne Mailer] Error sending mail:', err.message);
    return { success: false, error: err.message };
  }
};

