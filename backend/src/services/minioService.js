const { Client } = require('minio');

let minioClient = null;

function getMinioClient() {
  if (!minioClient) {
    minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || 'minio',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    });
  }
  return minioClient;
}

async function ensureBucket() {
  const client = getMinioClient();
  const bucketName = process.env.MINIO_BUCKET || 'receipts';
  
  try {
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName, 'us-east-1');
      console.log(`Bucket ${bucketName} created successfully`);
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error);
  }
}

async function uploadFile(file, filename) {
  const client = getMinioClient();
  const bucketName = process.env.MINIO_BUCKET || 'receipts';
  
  try {
    await client.putObject(bucketName, filename, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });
    
    // Generate URL (7 days expiry)
    const url = await client.presignedGetObject(bucketName, filename, 24 * 60 * 60 * 7);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

module.exports = {
  getMinioClient,
  ensureBucket,
  uploadFile
};
