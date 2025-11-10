const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'accounting-files';

const ensureBucket = async () => {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, 'us-east-1');
  }
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file provided' } });
    }
    
    await ensureBucket();
    
    const fileName = `${Date.now()}-${req.file.originalname}`;
    await minioClient.putObject(bucketName, fileName, req.file.buffer, req.file.size);
    
    const url = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`;
    
    res.json({ url, fileName });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
};

exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'No files provided' } });
    }
    
    await ensureBucket();
    
    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const fileName = `${Date.now()}-${file.originalname}`;
        await minioClient.putObject(bucketName, fileName, file.buffer, file.size);
        return {
          url: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucketName}/${fileName}`,
          fileName,
        };
      })
    );
    
    res.json(uploads);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
};
