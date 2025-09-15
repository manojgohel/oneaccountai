import nodemailer, { Transporter } from 'nodemailer';

// Types for function parameters
interface EmailParams {
    email: string;
    subject: string;
    message: string;
}

interface EmailResponse {
    status: boolean;
    message: string;
    messageId?: string;
    error?: string;
}

// SMTP transporter setup
const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465;

const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: false,
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    } : undefined,
    pool: true, // use pooled connections
    maxConnections: 5, // limit concurrent connections
    maxMessages: 100, // limit messages per connection

});

/**
 * Send Email using SMTP
 * @param email - Email address to send to
 * @param subject - Email subject
 * @param message - Email content to send
 * @returns Promise with email response status
 */
export default async function sendEmail(
    email: string,
    subject: string,
    message: string
): Promise<EmailResponse> {
    try {
        // Validate inputs
        if (!email || !message || !subject) {
            return {
                status: false,
                message: "Email, subject, and message are required",
                error: "Missing required parameters"
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                status: false,
                message: "Invalid email format",
                error: "Invalid email format"
            };
        }

        const from = process.env.FROM_EMAIL || 'noreply@oneaccountai.com';

        console.log("🚀 Sending email via SMTP:", {
            to: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
            subject: subject,
            messageLength: message.length,
            host: process.env.SMTP_HOST,
            port,
            secure,
        });

        const info = await transporter.sendMail({
            from,
            to: email,
            subject,
            text: message,
            html: `<p>${message}</p>`,
        });

        console.log("✅ Email sent successfully! Message ID:", info.messageId);

        return {
            status: true,
            message: "Email sent successfully",
            messageId: info.messageId
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        console.error("❌ Error sending email:", errorMessage);
        return {
            status: false,
            message: "Failed to send email",
            error: errorMessage
        };
    }
}

/**
 * Validate if email service is properly configured
 * @returns boolean indicating if email service is configured
 */
export function isEmailConfigured(): boolean {
    const hasHost = !!process.env.SMTP_HOST;
    const hasPort = !!process.env.SMTP_PORT;
    const hasFrom = !!process.env.FROM_EMAIL;
    const hasUser = !!process.env.SMTP_USER;
    const hasPass = !!process.env.SMTP_PASS;
    const authOk = (!hasUser && !hasPass) || (hasUser && hasPass);
    return hasHost && hasPort && hasFrom && authOk;
}