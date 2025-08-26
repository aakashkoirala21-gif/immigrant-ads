import { transporter } from '../config/nodemailer.config';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  const mailOptions = {
    from: `"Pro Connect Application" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Email sent: ${info.response}`);
    }
  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message || error);
    throw new Error('Failed to send email');
  }
};
