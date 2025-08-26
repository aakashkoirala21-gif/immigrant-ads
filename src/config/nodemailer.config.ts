import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST!,
  port: Number(process.env.EMAIL_PORT!), // 465 for secure SSL/TLS, 587 for TLS (recommended)
  secure: false, // true if using port 465
  auth: {
    user: process.env.EMAIL_USER!, // Email address
    pass: process.env.EMAIL_PASSWORD!, // App password
  },
});

// Optional verify (for testing the connection)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email setup error:', error);
  } else {
    console.log('✅ Nodemailer is ready to send emails');
  }
});
