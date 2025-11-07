import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mime from 'mime-types';

// Load environment variables
dotenv.config({ path: '.env.r2' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.resolve(__dirname, '../public/assets');
const R2_PREFIX = 'assets';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Format file size
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Upload single file
 */
const uploadFile = async (localPath, remotePath) => {
  try {
    const fileContent = fs.readFileSync(localPath);
    const contentType = mime.lookup(localPath) || 'application/octet-stream';
    const fileSize = fs.statSync(localPath).size;

    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000',
    }));

    console.log(`✅ ${remotePath} (${formatSize(fileSize)})`);
    return { success: true, size: fileSize };
  } catch (error) {
    console.error(`❌ ${remotePath}: ${error.message}`);
    return { success: false, size: 0 };
  }
};

/**
 * Upload directory recursively
 */
const uploadDirectory = async (dir, prefix = R2_PREFIX) => {
  let successCount = 0;
  let failCount = 0;
  let totalSize = 0;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const relativePath = path.relative(ASSETS_DIR, fullPath).replace(/\\/g, '/');
    const remotePath = `${R2_PREFIX}/${relativePath}`;

    if (item.isDirectory()) {
      const result = await uploadDirectory(fullPath, remotePath);
      successCount += result.successCount;
      failCount += result.failCount;
      totalSize += result.totalSize;
    } else {
      const result = await uploadFile(fullPath, remotePath);
      if (result.success) {
        successCount++;
        totalSize += result.size;
      } else {
        failCount++;
      }
    }
  }

  return { successCount, failCount, totalSize };
};

/**
 * Main function
 */
const main = async () => {
  console.log('🚀 Syncing assets to R2...\n');
  console.log(`📁 Local: ${ASSETS_DIR}`);
  console.log(`📦 Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${process.env.R2_PUBLIC_URL}`);
  console.log(`📂 Remote prefix: ${R2_PREFIX}\n`);

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`❌ Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  const startTime = Date.now();
  const result = await uploadDirectory(ASSETS_DIR);
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNC SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${result.successCount} files`);
  console.log(`❌ Failed: ${result.failCount} files`);
  console.log(`📦 Total size: ${formatSize(result.totalSize)}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(60));
  console.log('\n✅ Sync completed!\n');
};

// Validate credentials
if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('❌ Missing R2 credentials in .env.r2');
  process.exit(1);
}

main().catch(console.error);