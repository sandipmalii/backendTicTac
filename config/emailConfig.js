// Import the required modules
import dotenv from 'dotenv'; // Import dotenv for environment variable configuration
dotenv.config(); // Load environment variables from .env file
import nodemailer from 'nodemailer'; // Import nodemailer for sending emails

// Create a transporter object for sending emails
let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // SMTP server hostname
  port: process.env.EMAIL_PORT, // SMTP server port
  secure: false, // Set to true if using SSL/TLS, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // SMTP server username (e.g., email address)
    pass: process.env.EMAIL_PASS, // SMTP server password
  },
});

// Export the transporter object for use in other parts of the application
export default transporter;
