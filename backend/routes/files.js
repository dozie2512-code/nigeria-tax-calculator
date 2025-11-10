const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/', upload.single('file'), fileController.uploadFile);
router.post('/multiple', upload.array('files', 10), fileController.uploadMultipleFiles);

module.exports = router;
