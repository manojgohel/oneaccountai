import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

export async function GET(request, { params }) {
    const { imageName } = await params;
    if (!imageName) {
        return NextResponse.json({ error: 'Image name is required' }, { status: 400 });
    }

    const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: imageName,
    };

    try {
        const command = new GetObjectCommand(s3Params);
        const data = await s3.send(command);

        // Convert stream to buffer
        const streamToBuffer = async (stream) => {
            return new Promise((resolve, reject) => {
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', reject);
            });
        };

        const buffer = await streamToBuffer(data.Body);

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': data.ContentType || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${imageName}"`,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }
}
