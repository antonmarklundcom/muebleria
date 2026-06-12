import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 (S3-compatible) presigned uploads for transfer receipts.
 * If the R2 env set is absent the API returns a "not configured" signal and
 * the client falls back to sending the receipt via WhatsApp — an upload
 * problem must never block a sale (NEVER-BLOCK rule).
 */

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

export async function presignReceiptUpload(params: {
  key: string;
  contentType: string;
  size: number;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucket = process.env.R2_BUCKET!;

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      ContentType: params.contentType,
      ContentLength: params.size,
    }),
    { expiresIn: 600 },
  );

  // R2_PUBLIC_BASE_URL: the bucket's public domain (r2.dev or custom domain).
  const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '');
  const publicUrl = publicBase
    ? `${publicBase}/${params.key}`
    : `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${params.key}`;

  return { uploadUrl, publicUrl };
}
