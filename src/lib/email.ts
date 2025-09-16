/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

interface EmailResponse {
    status: boolean;
    message: string;
    messageId?: string;
    error?: string;
}

const MAILBABY_API_URL = process.env.MAILBABY_API_URL || 'https://api.mailbaby.net/mail/send';
const MAILBABY_API_KEY = process.env.MAILBABY_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@oneaccountai.com';

function maskEmail(value: string) {
    return value.replace(/(.{2}).*(@.*)/, '$1***$2');
}

/**
 * Send Email using MailBaby API
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
        if (!email || !message || !subject) {
            return {
                status: false,
                message: 'Email, subject, and message are required',
                error: 'Missing required parameters',
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                status: false,
                message: 'Invalid email format',
                error: 'Invalid email format',
            };
        }

        if (!MAILBABY_API_KEY) {
            return {
                status: false,
                message: 'Email service not configured',
                error: 'Missing MAILBABY_API_KEY',
            };
        }

        const from = DEFAULT_FROM_EMAIL;


        console.log('🚀 Sending email via MailBaby:', {
            to: maskEmail(email),
            subject,
            bodyLength: message.length,
            url: MAILBABY_API_URL,
        });

        const payload = {
            to: email,
            from,
            subject,
            body: message,
        };

        const res = await axios.post(MAILBABY_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': MAILBABY_API_KEY,
            },
            maxBodyLength: Infinity,
            timeout: 15000,
        });

        const messageId =
            (res.data && (res.data.id || res.data.messageId)) ||
            res.headers?.['x-message-id'];

        console.log('✅ Email sent via MailBaby:', { messageId, status: res.status });

        return {
            status: true,
            message: 'Email sent successfully',
            messageId,
        };
    } catch (error: any) {
        let errorMessage = 'Unknown error occurred';
        if (error?.response) {
            errorMessage = `${error.response.status}: ${JSON.stringify(error.response.data)}`;
        } else if (error?.request) {
            errorMessage = 'No response received from MailBaby';
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error('❌ Error sending email via MailBaby:', errorMessage);
        return {
            status: false,
            message: 'Failed to send email',
            error: errorMessage,
        };
    }
}

/**
 * Validate if email service is properly configured
 * @returns boolean indicating if email service is configured
 */
export function isEmailConfigured(): boolean {
    return Boolean(MAILBABY_API_KEY && DEFAULT_FROM_EMAIL);
}