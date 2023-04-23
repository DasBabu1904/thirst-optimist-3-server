const multer = require('multer');
const path = require('path');
// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, 'upload_at_' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

module.exports = upload;