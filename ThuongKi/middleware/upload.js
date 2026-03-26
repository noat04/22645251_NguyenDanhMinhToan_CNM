const multer = require("multer");

// Chuyển sang dùng memoryStorage để lưu tạm file vào bộ nhớ (RAM)
// Thay vì lưu xuống ổ cứng máy chủ
const storage = multer.memoryStorage();

// Cấu hình upload với storage mới
const upload = multer({ storage: storage });

module.exports = { upload };