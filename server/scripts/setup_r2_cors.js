import { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const {
  CLOUDFLARE_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME = 'edutorai-storage',
} = process.env;

if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ Missing Cloudflare R2 credentials in .env file.');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function configureCors() {
  console.log(`[R2 CORS] Configuring bucket "${R2_BUCKET_NAME}"...`);

  const corsRules = [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'HEAD', 'POST', 'DELETE'],
      AllowedOrigins: ['*'],
      ExposeHeaders: ['ETag'],
      MaxAgeSeconds: 3600,
    },
  ];

  try {
    await s3Client.send(
      new PutBucketCorsCommand({
        Bucket: R2_BUCKET_NAME,
        CORSConfiguration: {
          CORSRules: corsRules,
        },
      })
    );

    console.log('✅ CORS successfully configured on Cloudflare R2 bucket!');

    const res = await s3Client.send(
      new GetBucketCorsCommand({
        Bucket: R2_BUCKET_NAME,
      })
    );
    console.log('Current Active CORS Rules:', JSON.stringify(res.CORSRules, null, 2));
  } catch (err) {
    console.error('❌ Failed to configure CORS on R2 bucket:', err.message);
    process.exit(1);
  }
}

configureCors();
