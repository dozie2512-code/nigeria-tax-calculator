const multer = require('multer');
const { uploadFile } = require('../services/minioService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

/**
 * Upload file endpoint
 */
async function uploadFileHandler(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filename = `${Date.now()}-${req.file.originalname}`;
    const url = await uploadFile(req.file, filename);
    
    res.json({
      message: 'File uploaded successfully',
      url,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
}

module.exports = {
  upload,
  uploadFileHandler
};
