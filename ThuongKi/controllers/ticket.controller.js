const ticketModel = require("../models/ticket"); 
// Nhớ sửa lại đường dẫn này trỏ ĐÚNG vào file chứa hàm uploadFile AWS S3 của bạn nhé!
const { uploadFile } = require("../services/ticket.service"); 
const { validatePayload } = require("../middleware/validation");

const TicketController = {};

TicketController.getTickets = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        const statusFilter = req.query.status; 
        
        let tickets = keyword ? await ticketModel.searchTickets(keyword) : await ticketModel.getTickets(statusFilter);
        return res.render("index", { tickets: tickets, keyword: keyword });
    } catch (error) {
        console.error("Lỗi get tickets:", error);
        res.status(500).send("Lỗi tải danh sách vé");
    }
};

TicketController.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        const ticket = await ticketModel.getTicketById(id);
        if (!ticket) return res.status(404).send("Không tìm thấy vé");
        return res.render("detail", { ticket: ticket });
    } catch (error) {
        console.error("Lỗi get ticket detail:", error);
        res.status(500).send("Lỗi tải chi tiết vé");
    }
};

TicketController.renderCreate = async (req, res) => {
    return res.render("create");
};

// --- HÀM CREATE ĐÃ SỬA ĐỂ ĐẨY LÊN S3 ---
TicketController.create = async (req, res) => {
    try {
        const errors = validatePayload(req.body);
        if (errors) {
            return res.status(400).send(`Lỗi nhập liệu: ${errors.join(" | ")}`);
        }

        let imageUrl = "";
        // GỌI HÀM UPLOAD LÊN S3
        if (req.file) {
            imageUrl = await uploadFile(req.file); // Hàm này trả về link CloudFront/S3
        }

        const newTicketData = { ...req.body, imageUrl: imageUrl };
        await ticketModel.createTicket(newTicketData);
        
        return res.redirect("/tickets"); 
    } catch (error) {
        console.error("Lỗi create ticket:", error);
        res.status(500).send("Lỗi tạo vé mới");
    }
};

TicketController.renderUpdate = async (req, res) => {
    try {
        const id = req.params.id;
        const ticket = await ticketModel.getTicketById(id);
        if (!ticket) return res.status(404).send("Không tìm thấy vé");
        return res.render("edit", { ticket: ticket }); 
    } catch (error) {
        console.error("Lỗi render edit:", error);
        res.status(500).send("Lỗi tải trang cập nhật");
    }
};

// --- HÀM UPDATE ĐÃ SỬA ĐỂ ĐẨY LÊN S3 ---
TicketController.update = async (req, res) => {
    try {
        const id = req.params.id;
        const errors = validatePayload(req.body);
        
        if (errors) {
            return res.status(400).send(`Lỗi nhập liệu: ${errors.join(" | ")}`);
        }

        const oldTicket = await ticketModel.getTicketById(id);
        if (!oldTicket) return res.status(404).send("Không tìm thấy vé");

        let imageUrl = oldTicket.imageUrl; 

        // Nếu có ảnh mới thì UPLOAD LÊN S3
        if (req.file) {
            imageUrl = await uploadFile(req.file); 
            // Bỏ lệnh deleteLocalFile đi vì ảnh cũ đang ở trên S3, không nằm ở máy chủ local nữa
        }

        const updatedTicketData = { ...req.body, imageUrl: imageUrl };
        await ticketModel.updateTicket(id, updatedTicketData);
        
        return res.redirect("/tickets");
    } catch (error) {
        console.error("Lỗi update ticket:", error);
        res.status(500).send("Lỗi cập nhật vé");
    }
};

TicketController.delete = async (req, res) => {
    try {
        const id = req.params.id;
        // Bỏ lệnh deleteLocalFile đi, chỉ cần xóa record trong Database thôi
        await ticketModel.deleteTicket(id);
        return res.redirect("/tickets");
    } catch (error) {
        console.error("Lỗi delete ticket:", error);
        res.status(500).send("Lỗi xóa vé");
    }
};

module.exports = TicketController;