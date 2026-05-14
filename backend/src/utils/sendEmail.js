const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ✅ FIX 1: Validate required options (ab yeh check karega ki ya toh 'message' ho ya 'text' ho)
  if (!options.email || !options.subject || (!options.message && !options.text)) {
    throw new Error('Email, subject, and either message (HTML) or text are required');
  }

  let transporter;

  // Development mode: use Mailtrap or mock (no actual email sent)
  if (process.env.NODE_ENV === 'development' && process.env.EMAIL_MOCK === 'true') {
    console.log('📧 MOCK EMAIL (DEV MODE):');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: ${options.message || options.text}`);
    return;
  }

  // Mailtrap configuration (for testing without Gmail App Password)
  if (process.env.EMAIL_PROVIDER === 'mailtrap' || (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS)) {
    transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
      port: process.env.MAILTRAP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });
  }
  // SendGrid configuration
  else if (process.env.EMAIL_PROVIDER === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: options.email,
      from: process.env.EMAIL_USER,
      subject: options.subject,
      html: options.message,
      text: options.text, // ✅ FIX 2: SendGrid me bhi text add kiya
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent to ${options.email}`);
      return;
    } catch (error) {
      console.error('SendGrid error:', error.message);
      throw new Error(`Failed to send email via SendGrid: ${error.message}`);
    }
  }
  // Gmail SMTP (default)
  else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Use Gmail App Password (16 chars)
      }
    });
  }
  else {
    throw new Error(
      'Email service not configured. Set one of: ' +
      '1) EMAIL_USER + EMAIL_PASS (Gmail App Password), ' +
      '2) MAILTRAP_USER + MAILTRAP_PASS (Mailtrap), ' +
      '3) SENDGRID_API_KEY (SendGrid), ' +
      '4) EMAIL_MOCK=true (Development mock)'
    );
  }

  // ✅ FIX 3: mailOptions mein text and html dono handle karein
  const mailOptions = {
    from: process.env.EMAIL_USER || process.env.MAILTRAP_USER || 'noreply@luxestore.com',
    to: options.email,
    subject: options.subject,
    html: options.message, // Agar HTML message pass kiya (e.g., signup)
    text: options.text     // Agar plain text pass kiya (e.g., OTP)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error('Email service error:', error.message);
    
    if (error.message.includes('Invalid login') || error.message.includes('Authentication failed')) {
      throw new Error(
        'Email authentication failed. ' +
        'For Gmail: Use an App Password (not OAuth token). Generate at: https://myaccount.google.com/apppasswords ' +
        'For testing: Use Mailtrap (https://mailtrap.io) or set EMAIL_MOCK=true'
      );
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

module.exports = sendEmail;