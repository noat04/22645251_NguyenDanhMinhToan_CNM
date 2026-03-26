const ProductModel = require("../models/index");
const { deleteLocalFile } = require("../middleware/upload");
const { validatePayload } = require("../middleware/validation");
const fs = require("fs");
const ProductController = {};

ProductController.getAll = async (req, res) => {
  try {
    const keyword = req.query.keyword;
    let products;

    if (keyword) {
      products = await ProductModel.searchProducts(keyword);
    } else {
      products = await ProductModel.getProducts();
    }
    return res.render("index", { products: products, keyword: keyword });
  } catch (error) {
    console.error("Lỗi get products:", error);
    res.status(500).send("Lỗi tải danh sách sản phẩm");
  }
};
ProductController.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getProductById(id);
    if (product) {
      return res.render("detail", { product });
    }
    return res.status(404).send("Không tìm thấy sản phẩm");
  } catch (error) {
    console.error("Lỗi get detail:", error);
    res.status(500).send("Lỗi tải chi tiết");
  }
};

ProductController.renderCreateForm = (req, res) => {
  res.render("create");
};

ProductController.createProduct = async (req, res) => {
  try {
    const { name, price, unit_in_stock } = req.body;
    let url_image = "";

    const validationErrors = validatePayload(req.body);

    if (validationErrors) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      // Trả về trình duyệt mảng lỗi (bạn có thể render lại form báo lỗi cho đẹp hơn)
      return res.status(400).send(`Lỗi nhập liệu: ${validationErrors.join(" | ")}`);
    }

    // 2. DỮ LIỆU CHUẨN RỒI THÌ LƯU DB BÌNH THƯỜNG
    if (req.file) {
      url_image = "/uploads/" + req.file.filename;
    }

    const newProduct = { name, price, unit_in_stock, url_image };
    await ProductModel.createProduct(newProduct);

    res.redirect("/products");
  } catch (error) {
    console.error("Lỗi create:", error);
    res.status(500).send("Lỗi thêm sản phẩm");
  }
};

// 5. Render Form Sửa sản phẩm (Giống code cũ của bạn)
ProductController.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.getProductById(id);
    if (product) {
      return res.render("edit", { product });
    }
    return res.status(404).send("Không tìm thấy sản phẩm");
  } catch (error) {
    console.error("Lỗi render edit:", error);
    res.status(500).send("Lỗi tải form sửa");
  }
};

// 6. Xử lý Cập nhật & Upload ảnh mới, Xóa ảnh cũ (Tiêu chí 5 + Điểm cộng)
ProductController.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, unit_in_stock } = req.body;
    // 1. GỌI HÀM KIỂM TRA DỮ LIỆU
    const validationErrors = validatePayload(req.body);

    if (validationErrors) {
      // Nếu có lỗi, xóa luôn cái ảnh vừa upload lên ổ cứng (để tránh rác máy)
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      // Trả về trình duyệt mảng lỗi (bạn có thể render lại form báo lỗi cho đẹp hơn)
      return res.status(400).send(`Lỗi nhập liệu: ${validationErrors.join(" | ")}`);
    }

    // Lấy thông tin sản phẩm cũ để lấy đường dẫn ảnh cũ
    const oldProduct = await ProductModel.getProductById(id);
    let url_image = oldProduct.url_image; // Mặc định giữ lại ảnh cũ

    // Nếu người dùng có chọn upload ảnh mới
    if (req.file) {
      url_image = "/uploads/" + req.file.filename; // Cập nhật đường dẫn mới

      // Xóa ảnh cũ trong ổ cứng đi cho nhẹ máy (Điểm cộng)
      if (oldProduct.url_image) {
        deleteLocalFile(oldProduct.url_image);
      }
    }

    const updatedData = { name, price, unit_in_stock, url_image };
    await ProductModel.updateProduct(id, updatedData);

    res.redirect("/products");
  } catch (error) {
    console.error("Lỗi update:", error);
    res.status(500).send("Lỗi cập nhật sản phẩm");
  }
};

// 7. Xử lý Xóa sản phẩm (Tiêu chí 6 + Điểm cộng xóa ảnh)
ProductController.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin để biết đường dẫn ảnh mà xóa
    const product = await ProductModel.getProductById(id);
    if (product && product.url_image) {
      deleteLocalFile(product.url_image); // Xóa ảnh local (Điểm cộng)
    }

    // Xóa record trong DB
    await ProductModel.deleteProduct(id);

    res.redirect("/products");
  } catch (error) {
    console.error("Lỗi delete:", error);
    res.status(500).send("Lỗi xóa sản phẩm");
  }
};

module.exports = ProductController;