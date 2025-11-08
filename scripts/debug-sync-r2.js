import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mime from 'mime-types';

// Load environment variables
dotenv.config({ path: '.env.r2' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Config
const WATCH_DIR = path.resolve(__dirname, '../public/assets');

console.log('🔍 DEBUG: Watch directory path:', WATCH_DIR);
console.log('🔍 DEBUG: Watch directory exists:', fs.existsSync(WATCH_DIR));

// Cloudflare R2 Config
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to R2 - DEBUG VERSION
 */
const uploadFile = async (localPath) => {
  try {
    console.log('\n🔍 DEBUG: Upload function called for:', localPath);
    console.log('🔍 DEBUG: File exists:', fs.existsSync(localPath));

    const fileContent = fs.readFileSync(localPath);
    const relativePath = path.relative(WATCH_DIR, localPath).replace(/\\/g, '/');
    const remotePath = `assets/${relativePath}`;
    const contentType = mime.lookup(localPath) || 'application/octet-stream';
    const fileSize = fs.statSync(localPath).size;

    console.log('🔍 DEBUG: Remote path:', remotePath);
    console.log('🔍 DEBUG: Content type:', contentType);
    console.log('🔍 DEBUG: File size:', fileSize);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600',
    });

    console.log('🔍 DEBUG: Sending command to R2...');
    const result = await s3Client.send(command);
    console.log('🔍 DEBUG: R2 response:', result);

    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] Uploaded: ${remotePath} (${fileSize} bytes)`);

    return true;
  } catch (error) {
    console.error('\n❌ DEBUG: Upload error details:');
    console.error('  - File path:', localPath);
    console.error('  - Error name:', error.name);
    console.error('  - Error message:', error.message);
    console.error('  - Full error:', error);
    return false;
  }
};

/**
 * Initialize file watcher - DEBUG VERSION
 */
const startWatcher = () => {
  console.log('\n🚀 DEBUG Auto-Sync R2 Watcher Starting...\n');
  console.log(`📁 Watching: ${WATCH_DIR}`);
  console.log(`📦 Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${process.env.R2_PUBLIC_URL}`);
  console.log('\n⏳ Initializing watcher...\n');

  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  // File added
  watcher.on('add', async (filePath) => {
    console.log('\n📄 EVENT: File added ->', filePath);
    await uploadFile(filePath);
  });

  // File changed
  watcher.on('change', async (filePath) => {
    console.log('\n🔄 EVENT: File changed ->', filePath);
    await uploadFile(filePath);
  });

  // File deleted
  watcher.on('unlink', (filePath) => {
    console.log('\n🗑️ EVENT: File deleted ->', filePath);
    console.log('  (Note: Delete not implemented in this script)');
  });

  // Error handler
  watcher.on('error', (error) => {
    console.error('\n❌ Watcher error:', error);
  });

  // Ready
  watcher.on('ready', () => {
    console.log('\n✅ Watcher ready and listening for events!');
    console.log('Try creating or modifying a file in public/assets/\n');
  });
};

// Check if watch directory exists
if (!fs.existsSync(WATCH_DIR)) {
  console.error(`❌ Watch directory not found: ${WATCH_DIR}`);
  process.exit(1);
}

// Start watching
startWatcher();