
import { PublishCommand, PublishCommandOutput, SNSClient } from "@aws-sdk/client-sns";

// Types for function parameters
interface SMSParams {
    phoneNumber: string;
    message: string;
}

interface SMSResponse {
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
 * Send SMS using AWS SNS
 * @param phoneNumber - Phone number in E.164 format (e.g., "+919876543210")
 * @param message - Message content to send
 * @returns Promise with SMS response status
 */
export default async function sendSMS(
    phoneNumber: string,
    message: string
): Promise<SMSResponse> {
    try {
        // Validate inputs
        if (!phoneNumber || !message) {
            return {
                status: false,
                message: "Phone number and message are required",
                error: "Missing required parameters"
            };
        }

        // Validate phone number format (basic E.164 validation)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return {
                status: false,
                message: "Invalid phone number format. Use E.164 format (e.g., +919876543210)",
                error: "Invalid phone number format"
            };
        }

        const params = {
            Message: message,
            PhoneNumber: phoneNumber,
        };

        console.log("🚀 Sending SMS with params:", {
            phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number for security
            messageLength: message.length
        });

        const command = new PublishCommand(params);
        const response: PublishCommandOutput = await snsClient.send(command);

        console.log("✅ SMS sent successfully! Message ID:", response.MessageId);

        return {
            status: true,
            message: "SMS sent successfully",
            messageId: response.MessageId
        };

    } catch (error) {
        console.error("❌ Error sending SMS:", error);

        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

        return {
            status: false,
            message: "Failed to send SMS",
            error: errorMessage
        };
    }
}

/**
 * Validate if AWS SNS is properly configured
 * @returns boolean indicating if SNS is configured
 */
export function isSNSConfigured(): boolean {
    return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_REGION
    );
}

/**
 * Format phone number to E.164 format
 * @param phoneNumber - Phone number in various formats
 * @param countryCode - Default country code (e.g., "+91" for India)
 * @returns Formatted phone number in E.164 format
 */
export function formatPhoneNumber(phoneNumber: string, countryCode: string = "+91"): string {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');

    // If it already starts with country code, return as is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber;
    }

    // If it starts with country code without +, add +
    if (digits.startsWith(countryCode.replace('+', ''))) {
        return `+${digits}`;
    }

    // Otherwise, prepend country code
    return `${countryCode}${digits}`;
}

/**
 * Send bulk SMS to multiple recipients
 * @param recipients - Array of phone numbers
 * @param message - Message to send to all recipients
 * @returns Promise with bulk SMS results
 */
export async function sendBulkSMS(
    recipients: string[],
    message: string
): Promise<{
    successful: string[];
    failed: string[];
    totalSent: number;
    totalFailed: number;
}> {
    const successful: string[] = [];
    const failed: string[] = [];

    for (const phoneNumber of recipients) {
        try {
            const result = await sendSMS(phoneNumber, message);
            if (result.status) {
                successful.push(phoneNumber);
            } else {
                failed.push(phoneNumber);
            }
        } catch (error) {
            failed.push(phoneNumber);
            console.error(`Failed to send SMS to ${phoneNumber}:`, error);
        }
    }

    return {
        successful,
        failed,
        totalSent: successful.length,
        totalFailed: failed.length
    };
}