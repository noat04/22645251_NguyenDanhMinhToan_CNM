const { dynamodb } = require("../utils/aws-helper");
const { v4: uuidv4 } = require("uuid");

const tableName = "ticket";

// --- HELPER NGHIỆP VỤ ---
// Hàm này chịu trách nhiệm tính toán tiền và gán nhãn giảm giá cho từng vé
const calculateTicketLogic = (quantity, pricePerTicket, category) => {
    const qty = Number(quantity);
    const price = Number(pricePerTicket);
    
    // 1. Tính tổng thành tiền
    const totalAmount = qty * price;
    let finalAmount = totalAmount;
    let discountLabel = "Không giảm giá"; // Mặc định là không giảm

    // 2. Áp dụng logic giảm giá theo loại và số lượng
    if (category === "VIP" && qty >= 4) {
        finalAmount = totalAmount * 0.90; // Giảm 10%
        discountLabel = "Được giảm giá";
    } else if (category === "VVIP" && qty >= 2) {
        finalAmount = totalAmount * 0.85; // Giảm 15%
        discountLabel = "Được giảm giá";
    }

    return { totalAmount, finalAmount, discountLabel };
};

const TicketModel = {
    // THÊM MỚI VÉ
    createTicket: async (ticketData) => {
        // Gọi hàm xử lý nghiệp vụ để lấy các thông số tiền nong
        const logicData = calculateTicketLogic(ticketData.quantity, ticketData.pricePerTicket, ticketData.category);

        const params = {
            TableName: tableName,
            Item: {
                id: uuidv4(),
                eventName: ticketData.eventName,
                quantity: Number(ticketData.quantity),
                pricePerTicket: Number(ticketData.pricePerTicket),
                imageUrl: ticketData.imageUrl,
                holderName: ticketData.holderName,
                status: ticketData.status,
                category: ticketData.category,
                eventDate: ticketData.eventDate,
                // Lưu kết quả nghiệp vụ vào DB
                totalAmount: logicData.totalAmount,
                finalAmount: logicData.finalAmount,
                discountLabel: logicData.discountLabel, 
                createdAt: new Date().toISOString(),
            },
        };

        try {
            await dynamodb.put(params).promise();
            return params.Item;
        } catch (error) {
            throw error;
        }
    },

    // LẤY DANH SÁCH (Hỗ trợ lọc theo trạng thái)
    getTickets: async (statusFilter = null) => {
        const params = {
            TableName: tableName,
        };

        // Nếu Controller truyền vào status (Upcoming/Sold/Cancelled), thì thêm điều kiện Filter
        if (statusFilter) {
            params.FilterExpression = "#st = :statusValue";
            // Do chữ 'status' là từ khóa nhạy cảm của DynamoDB, nên ta phải dùng ExpressionAttributeNames (#st)
            params.ExpressionAttributeNames = {
                "#st": "status"
            };
            params.ExpressionAttributeValues = {
                ":statusValue": statusFilter
            };
        }

        try {
            const data = await dynamodb.scan(params).promise();
            return data.Items;
        } catch (error) {
            throw error;
        }
    },

    // LẤY CHI TIẾT
    getTicketById: async (id) => {
        const params = {
            TableName: tableName,
            Key: { id: id },
        };

        try {
            const data = await dynamodb.get(params).promise();
            return data.Item;
        } catch (error) {
            throw error;
        }
    },

    // CẬP NHẬT VÉ
    updateTicket: async (id, ticketData) => {
        // Cập nhật vé cũng phải tính toán lại tiền nhỡ người ta đổi Số lượng hoặc Loại ghế
        const logicData = calculateTicketLogic(ticketData.quantity, ticketData.pricePerTicket, ticketData.category);

        const params = {
            TableName: tableName,
            Key: { id: id },
            UpdateExpression: "SET eventName = :eventName, quantity = :quantity, pricePerTicket = :pricePerTicket, imageUrl = :imageUrl, holderName = :holderName, #st = :status, category = :category, eventDate = :eventDate, totalAmount = :totalAmount, finalAmount = :finalAmount, discountLabel = :discountLabel",
            ExpressionAttributeNames: {
                "#st": "status" // Tránh đụng từ khóa của DynamoDB
            },
            ExpressionAttributeValues: {
                ":eventName": ticketData.eventName,
                ":quantity": Number(ticketData.quantity),
                ":pricePerTicket": Number(ticketData.pricePerTicket),
                ":imageUrl": ticketData.imageUrl,
                ":holderName": ticketData.holderName,
                ":status": ticketData.status,
                ":category": ticketData.category,
                ":eventDate": ticketData.eventDate,
                // Cập nhật thêm các trường tính toán
                ":totalAmount": logicData.totalAmount,
                ":finalAmount": logicData.finalAmount,
                ":discountLabel": logicData.discountLabel
            },
        };

        try {
            await dynamodb.update(params).promise();
            return ticketData;
        } catch (error) {
            throw error;
        }
    },

    // XÓA VÉ
    deleteTicket: async (id) => {
        const params = {
            TableName: tableName,
            Key: { id: id },
        };

        try {
            await dynamodb.delete(params).promise();
            return true;
        } catch (error) {
            throw error;
        }
    },

    // TÌM KIẾM
    searchTickets: async (query) => {
        const params = {
            TableName: tableName,
            FilterExpression: "contains(eventName, :query) or contains(holderName, :query) or contains(category, :query)",
            ExpressionAttributeValues: {
                ":query": query,
            },
        };

        try {
            const data = await dynamodb.scan(params).promise();
            return data.Items;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = TicketModel;