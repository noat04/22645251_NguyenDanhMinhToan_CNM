const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticket.controller");

// (GIẢ ĐỊNH) Bạn nhớ import middleware upload mà bạn đã viết nhé
// Thay đường dẫn này bằng đúng nơi bạn để file cấu hình multer
const { upload } = require("../middleware/upload"); 

// 1. CÁC ROUTE CỐ ĐỊNH (Phải nằm trên)
router.get("/", ticketController.getTickets);
router.get("/create", ticketController.renderCreate);

// Nhớ chèn upload.single("imageUrl") để server bắt được file ảnh
router.post("/create", upload.single("imageUrl"), ticketController.create);

// Đổi /update thành /edit cho khớp HTML
router.get("/edit/:id", ticketController.renderUpdate);
router.post("/edit/:id", upload.single("imageUrl"), ticketController.update);

// Đổi từ .get sang .post cho khớp HTML Form
router.post("/delete/:id", ticketController.delete);

// 2. ROUTE CÓ THAM SỐ (Bắt buộc nằm dưới cùng để không "nuốt" các route khác)
router.get("/:id", ticketController.getOne);

module.exports = router;