const express = require('express');
const router = express.Router();
const { upload, uploadFileHandler } = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, upload.single('file'), uploadFileHandler);
router.post('/multiple', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const { uploadFile } = require('../services/minioService');
    const urls = [];
    
    for (const file of req.files) {
      const filename = `${Date.now()}-${file.originalname}`;
      const url = await uploadFile(file, filename);
      urls.push({ filename, url });
    }
    
    res.json({
      message: 'Files uploaded successfully',
      files: urls
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
});

module.exports = router;
