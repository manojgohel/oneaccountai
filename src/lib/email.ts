import { PublishCommand, PublishCommandOutput, SNSClient } from "@aws-sdk/client-sns";

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

// Create SNS client with proper typing
const snsClient: SNSClient = new SNSClient({
    region: process.env.AWS_REGION || 'us-east-1', // default region if not provided
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

/**
 * Send Email using AWS SNS
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

        const params = {
            Message: message,
            Subject: subject,
            TopicArn: process.env.AWS_SNS_EMAIL_TOPIC_ARN, // You'll need to create an SNS topic for email
            MessageAttributes: {
                'email': {
                    DataType: 'String',
                    StringValue: email
                }
            }
        };

        console.log("🚀 Sending email with params:", {
            email: email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for security
            subject: subject,
            messageLength: message.length
        });

        const command = new PublishCommand(params);
        const response: PublishCommandOutput = await snsClient.send(command);

        console.log("✅ Email sent successfully! Message ID:", response.MessageId);

        return {
            status: true,
            message: "Email sent successfully",
            messageId: response.MessageId
        };

    } catch (error) {
        console.error("❌ Error sending email:", error);

        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        return {
            status: false,
            message: "Failed to send email",
            error: errorMessage
        };
    }
}

/**
 * Alternative implementation using simple SMTP (if you prefer not to use SNS)
 * You can uncomment this and install nodemailer if you want to use SMTP instead
 */
/*
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export default async function sendEmail(
    email: string,
    subject: string,
    message: string
): Promise<EmailResponse> {
    try {
        const info = await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: subject,
            text: message,
            html: `<p>${message}</p>`,
        });

        return {
            status: true,
            message: "Email sent successfully",
            messageId: info.messageId
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return {
            status: false,
            message: "Failed to send email",
            error: errorMessage
        };
    }
}
*/

/**
 * Validate if email service is properly configured
 * @returns boolean indicating if email service is configured
 */
export function isEmailConfigured(): boolean {
    return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_REGION &&
        process.env.AWS_SNS_EMAIL_TOPIC_ARN
    );
}