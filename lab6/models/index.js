const { dynamodb } = require("../utils/aws-helper");
const { v4: uuidv4 } = require("uuid");

const tableName = "Products";

const ProductModel = {
  createProduct: async (productData) => {
    const productId = uuidv4();
    const params = {
      TableName: tableName,
      Item: {
        id: productId,
        name: productData.name,
        price: Number(productData.price),
        unit_in_stock: Number(productData.unit_in_stock),
        url_image: productData.url_image,
      },
    };
    try {
      await dynamodb.put(params).promise();
      return { id: productId, ...productData };
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  getProducts: async () => {
    const params = {
      TableName: tableName,
    };
    try {
      const products = await dynamodb.scan(params).promise();
      return products.Items;
    } catch (error) {
      console.error("Error getting products:", error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    const params = {
      TableName: tableName,
      Key: {
        id: productId,
      },
      UpdateExpression: "set #n = :name, #p = :price, #u = :unit_in_stock, #img = :url_image",
      ExpressionAttributeNames: {
        "#n": "name",
        "#p": "price",
        "#u": "unit_in_stock",
        "#img": "url_image",
      },
      ExpressionAttributeValues: {
        ":name": productData.name,
        ":price": Number(productData.price),
        ":unit_in_stock": Number(productData.unit_in_stock),
        ":url_image": productData.url_image,
      },
      ReturnValues: "ALL_NEW",
    };

    try {
      const updatedProduct = await dynamodb.update(params).promise();
      return updatedProduct.Attributes;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: productId,
      },
    };
    try {
      await dynamodb.delete(params).promise();
      return { id: productId };
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  getProductById: async (productId) => {
    const params = {
      TableName: tableName,
      Key: {
        id: productId,
      },
    };
    try {
      const data = await dynamodb.get(params).promise();
      return data.Item; 
    } catch (error) {
      console.error("Error getting one product:", error);
      throw error;
    }
  },

  searchProducts: async (keyword) => {
    const params = {
      TableName: tableName,
      FilterExpression: "contains(#n, :keyword)", 
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ExpressionAttributeValues: {
        ":keyword": keyword,
      },
    };

    try {
      const data = await dynamodb.scan(params).promise();
      return data.Items;
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sản phẩm:", error);
      throw error;
    }
  },
};

module.exports = ProductModel;