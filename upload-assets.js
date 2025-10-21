import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Get the current working directory
const ASSETS_DIR = path.resolve(process.cwd(), "public", "assets");

// Cloudflare R2 configuration
const R2_CONFIG = {
    endpoint:
        "https://31d345b5cfc89b66ae4c7e32424b0be9.r2.cloudflarestorage.com/",
    region: "auto",
    credentials: {
        accessKeyId: "1be7443b33e304ccb17ecb845533819f",
        secretAccessKey:
            "1386440d847d6b417d5655f5246c2a80c1ef052a45ee17f8a73f2d8e0d2b89d8",
    },
    bucketName: "musksci08012025",
};

// Create S3 client
const s3Client = new S3Client({
    endpoint: R2_CONFIG.endpoint,
    region: R2_CONFIG.region,
    credentials: R2_CONFIG.credentials,
});

// Function to create clean key path without duplicate segments
const createKeyPath = (relativePath, baseKey = "assets") => {
    // Remove any leading/trailing slashes
    const cleanRelativePath = relativePath.replace(/^\/+|\/+$/g, "");
    const cleanBaseKey = baseKey.replace(/^\/+|\/+$/g, "");

    // Combine paths and ensure no duplicate segments
    const fullPath = path.join(cleanBaseKey, cleanRelativePath);

    // Convert to forward slashes and ensure no duplicate paths
    return fullPath.replace(/\\/g, "/");
};

// File upload function
const uploadFile = async (filePath, bucketName) => {
    const fileContent = fs.readFileSync(filePath);

    // Create relative path from ASSETS_DIR
    const relativePath = path.relative(ASSETS_DIR, filePath);
    // Create clean key path
    const key = createKeyPath(relativePath);

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileContent,
    });

    try {
        await s3Client.send(command);
        console.log(`Uploaded: ${key}`);
    } catch (err) {
        console.error(`Failed to upload ${key}:`, err);
    }
};

// Recursive directory upload function
const uploadDirectory = async (directoryPath, bucketName) => {
    console.log(`Scanning directory: ${directoryPath}`);
    const items = fs.readdirSync(directoryPath);

    for (const item of items) {
        const fullPath = path.join(directoryPath, item);

        if (fs.lstatSync(fullPath).isDirectory()) {
            // If it's a directory, recursively upload its contents
            await uploadDirectory(fullPath, bucketName);
        } else {
            // Upload file
            await uploadFile(fullPath, bucketName);
        }
    }
};

console.log(`Asset directory path: ${ASSETS_DIR}`);

(async () => {
    console.log("Starting upload...");
    await uploadDirectory(ASSETS_DIR, R2_CONFIG.bucketName);
    console.log("Upload completed!");
})();
