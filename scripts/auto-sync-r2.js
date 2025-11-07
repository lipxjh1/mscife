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
const R2_PREFIX = 'assets'; // Remote path prefix

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
 * Get content type by file extension
 */
const getContentType = (filePath) => {
  return mime.lookup(filePath) || 'application/octet-stream';
};

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
 * Get relative path from watch directory
 */
const getRelativePath = (fullPath) => {
  return path.relative(WATCH_DIR, fullPath).replace(/\\/g, '/');
};

/**
 * Upload file to R2
 */
const uploadFile = async (localPath) => {
  try {
    const fileContent = fs.readFileSync(localPath);
    const relativePath = getRelativePath(localPath);
    const remotePath = `${R2_PREFIX}/${relativePath}`;
    const contentType = getContentType(localPath);
    const fileSize = fs.statSync(localPath).size;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: remotePath,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=3600', // Cache 1 hour
    });

    await s3Client.send(command);

    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] Uploaded: ${remotePath} (${formatSize(fileSize)})`);

    return true;
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] Error uploading ${localPath}:`, error.message);
    return false;
  }
};

/**
 * Initialize file watcher
 */
const startWatcher = () => {
  console.log('🚀 Auto-Sync R2 Watcher Started\n');
  console.log(`📁 Watching: ${WATCH_DIR}`);
  console.log(`📦 Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`🌐 Public URL: ${process.env.R2_PUBLIC_URL}`);
  console.log(`📂 Remote prefix: ${R2_PREFIX}`);
  console.log('\n⏳ Waiting for changes...\n');

  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't upload existing files on start
    awaitWriteFinish: {
      stabilityThreshold: 2000, // Wait 2s after file stops changing
      pollInterval: 100
    }
  });

  // File added
  watcher.on('add', async (filePath) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📄 [${timestamp}] New file detected: ${path.basename(filePath)}`);
    await uploadFile(filePath);
  });

  // File changed
  watcher.on('change', async (filePath) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] File changed: ${path.basename(filePath)}`);
    await uploadFile(filePath);
  });

  // Error handler
  watcher.on('error', (error) => {
    console.error('❌ Watcher error:', error);
  });

  // Ready
  watcher.on('ready', () => {
    console.log('✅ Watcher ready. Make changes to assets folder to trigger upload.\n');
  });
};

// Validate config
if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.error('❌ Missing R2 credentials in .env.r2 file');
  console.log('\nMake sure .env.r2 contains:');
  console.log('R2_ACCOUNT_ID=...');
  console.log('R2_ACCESS_KEY_ID=...');
  console.log('R2_SECRET_ACCESS_KEY=...');
  console.log('R2_BUCKET_NAME=...');
  process.exit(1);
}

// Check if watch directory exists
if (!fs.existsSync(WATCH_DIR)) {
  console.error(`❌ Watch directory not found: ${WATCH_DIR}`);
  console.log('\nCreate the directory first:');
  console.log(`mkdir -p ${WATCH_DIR}`);
  process.exit(1);
}

// Start watching
startWatcher();