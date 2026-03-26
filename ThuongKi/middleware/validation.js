const vnNameRegex = /^[a-zA-Z0-9]+$/;

const numberRegex = /^[0-9]+$/;

const categoryList = ["Standard", "VIP", "VVIP"];

const statusList = ["Upcoming", "Sold","Cancelled"];

const checkEmpty = (payload) => {
    const { eventName, pricePerTicket, quantity, holderName, category, eventDate,status } = payload;
    if (!eventName || pricePerTicket === "" || quantity === "" || holderName === "" || category === "" || eventDate === "" || status === "") {
        return true;
    }
    return false;
};

module.exports = {
    validatePayload: (payload) => {
        const { eventName, pricePerTicket, quantity, holderName, category, eventDate,status } = payload;
        const errors = [];

        if (checkEmpty(payload)) {
            errors.push("Vui lòng nhập đầy đủ Tên, Giá và Số lượng.");
        }

        if (eventName && !vnNameRegex.test(eventName.trim())) {
            errors.push("Tên sản phẩm không hợp lệ (không chứa ký tự đặc biệt).");
        }

        if (pricePerTicket && !numberRegex.test(pricePerTicket) || pricePerTicket <= 0) {
            errors.push("Giá sản phẩm phải là một số nguyên dương hợp lệ.");
        }

        if (quantity && !numberRegex.test(quantity) || quantity <= 0) {
            errors.push("Số lượng tồn kho phải là một số nguyên dương hợp lệ.");
        }

        if (status && !statusList.includes(status)) {
            errors.push("Trạng thái vé không hợp lệ.");
        }

        if (holderName && !vnNameRegex.test(holderName.trim())) {
            errors.push("Tên người sở hữu vé không hợp lệ (không chứa ký tự đặc biệt).");
        }

        if (category && !categoryList.includes(category)) {
            errors.push("Danh mục vé không hợp lệ.");
        }

        if (eventDate && eventDate < Date.now()) {
            errors.push("Ngày diễn ra sự kiện không hợp lệ (không chứa ký tự đặc biệt).");
        }

        if (errors.length > 0) {
            return errors;
        }

        return null;
    },
};