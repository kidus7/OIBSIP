const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || ''
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'PizzaApp'} <${process.env.EMAIL_FROM || 'noreply@pizzaapp.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
  } catch (error) {
    // Graceful fallback during development
    console.warn('⚠️ Nodemailer email failed to send (Check SMTP credentials):', error.message);
    console.log(`📩 [DEV EMAIL LOG] To: ${options.email} | Subject: ${options.subject}`);
    console.log(`Message Body:\n${options.message}`);
  }
};

module.exports = sendEmail;
