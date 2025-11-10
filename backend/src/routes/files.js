const express = require('express');
const router = express.Router();
const multer = require('multer');
const Minio = require('minio');

// Configure MinIO client
const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucket = process.env.MINIO_BUCKET || 'accounting-files';

// Ensure bucket exists
const ensureBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Bucket ${bucket} created`);
    }
  } catch (error) {
    console.error('Error ensuring bucket:', error);
  }
};

ensureBucket();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const metaData = {
      'Content-Type': req.file.mimetype
    };

    await minioClient.putObject(
      bucket,
      fileName,
      req.file.buffer,
      req.file.size,
      metaData
    );

    const fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${fileName}`;

    res.json({
      message: 'File uploaded successfully',
      fileName,
      fileUrl,
      size: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get file
router.get('/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    const dataStream = await minioClient.getObject(bucket, fileName);
    dataStream.pipe(res);
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;
