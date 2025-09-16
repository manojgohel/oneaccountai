/* eslint-disable @typescript-eslint/no-explicit-any */

'use server';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// Types
interface UploadResult {
    success?: boolean;
    url?: string;
    error?: string;
}

interface S3UploadParams {
    Bucket: string;
    Key: string;
    Body: Buffer;
    ContentType: string;
}

// Initialize S3 client with proper error handling
const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function uploadToS3(formData: any): Promise<any> {
    try {
        // Validate environment variables
        if (!process.env.AWS_S3_BUCKET || !process.env.AWS_REGION ||
            !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            return { error: 'Missing required AWS configuration' };
        }

        // Get and validate file
        const file = formData.get('file') as any | null;

        if (!file) {
            return { error: 'No file provided' };
        }

        if (!(file)) {
            return { error: 'Invalid file format' };
        }

        // Validate file size (e.g., max 10MB)
        const maxFileSize = 20 * 1024 * 1024; // 20MB
        if (file.size > maxFileSize) {
            return { error: 'File size exceeds 10MB limit' };
        }

        // Validate file type (optional - add your allowed types)
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'text/plain', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            return { error: 'File type not supported' };
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generate unique filename to prevent conflicts
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`;

        // S3 upload parameters
        const params: S3UploadParams = {
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: uniqueFileName,
            Body: buffer,
            ContentType: file.type,
        };

        // Upload to S3
        await s3.send(new PutObjectCommand(params));

        return {
            success: true,
            url: uniqueFileName
        };

    } catch (error) {
        console.error('S3 upload error:', error);

        // Type-safe error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';

        return {
            success: false,
            error: `Upload failed: ${errorMessage}`
        };
    }
}

// Additional utility function for deleting files
export async function deleteFromS3(fileName: string): Promise<UploadResult> {
    try {
        if (!process.env.AWS_S3_BUCKET) {
            return { error: 'Missing S3 bucket configuration' };
        }

        const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileName,
        };

        await s3.send(new DeleteObjectCommand(params));

        return { success: true };

    } catch (error) {
        console.error('S3 delete error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';

        return {
            error: `Delete failed: ${errorMessage}`
        };
    }
}

// Utility function to validate file before upload
export async function validateFile(file: any): Promise<{ valid: boolean; error?: string; }> {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxFileSize) {
        return { valid: false, error: 'File size exceeds 10MB limit' };
    }

    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
}
