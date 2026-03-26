const express = require("express");
const router = express.Router();

const ProductController = require("../controllers/index");
const { upload } = require("../middleware/upload");
router.get("/", ProductController.getAll);

router.get("/create", ProductController.renderCreateForm);

router.get("/:id", ProductController.getOne);

router.get("/edit/:id", ProductController.renderEditForm);


router.post("/create", upload.single("url_image"), ProductController.createProduct);

router.post("/edit/:id", upload.single("url_image"), ProductController.updateProduct);

router.post("/delete/:id", ProductController.deleteProduct);

module.exports = router;