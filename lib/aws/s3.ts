'use server';

import { env } from '@/env';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION!,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Function to create a presigned URL for PUT operation
const createPresignedUrl = async (
  bucketName: string,
  key: string,
): Promise<string> => {
  const command = new PutObjectCommand({ Bucket: bucketName, Key: key });
  const presignedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 120, // URL valid for 2 minutes
  });
  return presignedUrl;
};

// Function to create a presigned POST URL
const createPresignedUrlPost = async ({
  bucketName,
  key,
}: {
  bucketName: string;
  key: string;
}): Promise<{ url: string; fields: Record<string, string> }> => {
  const post = await createPresignedPost(s3Client, {
    Bucket: bucketName,
    Key: key,
    Conditions: [
      ['content-length-range', 0, 1048576], // Limit to 1 MB
    ],
    Expires: 3600, // URL valid for 1 hour
  });
  return post;
};

// Function to upload using the presigned URL
export const uploadUsingPresignedUrl = async ({
  bucketName,
  key,
  file,
}: {
  bucketName: string;
  key: string;
  file: Blob;
}): Promise<Response> => {
  const presignedUrl = await createPresignedUrl(bucketName, key);
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
  });
  if (!response.ok) {
    throw new Error('Failed to upload using presigned URL');
  }
  return response;
};

// Function to upload using the presigned POST URL
export const uploadUsingPresignedUrlPost = async ({
  bucketName,
  key,
  file,
}: {
  bucketName: string;
  key: string;
  file: File;
}): Promise<Response> => {
  const presignedPost = await createPresignedUrlPost({ bucketName, key });
  const formData = new FormData();
  Object.entries(presignedPost.fields).forEach(([fieldKey, value]) => {
    formData.append(fieldKey, value);
  });
  formData.append('file', file);

  const response = await fetch(presignedPost.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload using presigned POST URL');
  }
  return response;
};

// Function to upload directly to S3
export const uploadToS3 = async ({
  bucketName,
  key,
  body,
}: {
  bucketName: string;
  key: string;
  body: Uint8Array;
}): Promise<any> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
  });
  const response = await s3Client.send(command);
  return response;
};
