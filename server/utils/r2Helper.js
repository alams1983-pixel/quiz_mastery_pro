import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const {
  CLOUDFLARE_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME = 'edutorai-storage',
  R2_PUBLIC_DOMAIN,
} = process.env;

const isConfigured = Boolean(
  CLOUDFLARE_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  CLOUDFLARE_ACCOUNT_ID !== 'your_cloudflare_account_id_here' &&
  R2_ACCESS_KEY_ID !== 'your_r2_access_key_id_here'
);

let s3Client = null;

if (isConfigured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Check if real R2 credentials are provided
 */
export function checkR2Configured() {
  return isConfigured;
}

/**
 * Generate a pre-signed URL for direct browser upload to Cloudflare R2
 * @param {Object} params
 * @param {string} params.key - R2 object key path (e.g., tenants/inst-1/batches/b-2/notes.pdf)
 * @param {string} params.mimeType - File content type (e.g. application/pdf)
 * @param {number} [params.expiresIn=900] - URL validity in seconds (default 15 minutes)
 * @returns {Promise<{ uploadUrl: string, key: string }>}
 */
export async function generateR2UploadUrl({ key, mimeType = 'application/pdf', expiresIn = 900 }) {
  if (!isConfigured || !s3Client) {
    // Return mock upload URL in local testing mode
    console.warn('[R2] Warning: Cloudflare R2 credentials not configured, returning mock upload URL');
    return {
      uploadUrl: `/api/study-materials/mock-upload?key=${encodeURIComponent(key)}`,
      key,
      isMock: true,
    };
  }

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  return { uploadUrl, key, isMock: false };
}

/**
 * Generate a secure, time-limited pre-signed URL to read/download a file from R2
 * @param {Object} params
 * @param {string} params.key - R2 object key path
 * @param {number} [params.expiresIn=3600] - URL validity in seconds (default 1 hour)
 * @param {string} [params.downloadFilename] - Optional filename for attachment disposition
 * @returns {Promise<string>}
 */
export async function generateR2DownloadUrl({ key, expiresIn = 3600, downloadFilename = null }) {
  if (!isConfigured || !s3Client) {
    if (R2_PUBLIC_DOMAIN && !R2_PUBLIC_DOMAIN.includes('your-r2')) {
      return `${R2_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;
    }
    return `/uploads/${key.split('/').pop()}`;
  }

  const commandOptions = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
  };

  if (downloadFilename) {
    commandOptions.ResponseContentDisposition = `inline; filename="${encodeURIComponent(downloadFilename)}"`;
  }

  const command = new GetObjectCommand(commandOptions);
  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete an object from Cloudflare R2
 * @param {string} key - R2 object key
 */
export async function deleteR2Object(key) {
  if (!isConfigured || !s3Client) {
    console.log(`[R2 MOCK] Deleted object: ${key}`);
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error(`[R2] Failed to delete object ${key}:`, err);
    throw err;
  }
}
