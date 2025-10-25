const nodemailer = require("nodemailer")

// Build a nodemailer transporter from environment variables.
function buildTransportOptions() {
  const service = process.env.MAIL_SERVICE; // e.g., 'gmail', 'hotmail'
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    throw new Error('MAIL_USER and MAIL_PASS must be set in environment');
  }

  if (service) {
    return { service, auth: { user, pass } };
  }

  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = process.env.MAIL_PORT ? Number(process.env.MAIL_PORT) : 587;
  const secure = process.env.MAIL_SECURE ? process.env.MAIL_SECURE === 'true' : (port === 465);

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    tls: { ciphers: 'TLSv1.2' },
  };
}

async function getTransporter() {
  const options = buildTransportOptions();
  if ((options.host === '127.0.0.1' || options.host === 'localhost') && process.env.NODE_ENV !== 'test') {
    console.warn('[mailSender] MAIL_HOST points to localhost. Ensure a local SMTP server is running, or set MAIL_SERVICE/MAIL_HOST to a real SMTP.');
  }
  return nodemailer.createTransport(options);
}

async function mailSender(email, title, body) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"Campus Connect | group 8" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('[mailSender] Message sent:', info.messageId);
    }
    return info;
  } catch (error) {
    console.error('[mailSender] Failed to send email:', error.message);
    throw error;
  }
}

module.exports = mailSender
