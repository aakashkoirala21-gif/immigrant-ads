import { transporter } from "../config/nodemailer.config";

// An interface for our function's options for type safety
interface EmailOptions {
  to: string;
  subject: string;
  text: string; // We'll use 'text' for the plain text body
}

/**
 * Sends a simple, plain text email.
 * @param options - An object containing to, subject, and text.
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // 1. Define the email options
    const mailOptions = {
      from: `"PRO CONNECT" <${process.env.EMAIL_USER!}>`, // Your sender info
      to: options.to,
      subject: options.subject,
      text: options.text, 
    };

    // 2. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}`);

  } catch (error) {
    console.error(`❌ Failed to send email to ${options.to}:`, error);
    // We log the error but don't re-throw it, so a failed email doesn't break the request.
  }
}