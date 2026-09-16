# 🔌 CloudAutoScale - Tài Liệu RESTful API (API Documentation)

Tài liệu chi tiết về các API endpoints được cung cấp bởi **Node.js Express Backend Service**. Tất cả các response trả về đều ở định dạng JSON.

---

## 🌐 Base URL

- **Development Local**: `http://localhost:5000`
- **Production (AWS ALB)**: `http://<ALB-DNS-NAME>` (Ví dụ: `http://cloudautoscale-alb-123456789.ap-southeast-1.elb.amazonaws.com`)

---

## 📌 Headers Chuẩn

| Header Key | Content Value |
|---|---|
| `Content-Type` | `application/json` |

---

## 🟢 1. Healthcheck & System Metrics

### 🔍 `GET /healthcheck`
Dùng bởi **Application Load Balancer (ALB)** để kiểm tra máy chủ có sống hay không, đồng thời giúp Frontend hiển thị tên máy chủ EC2 đang phản hồi.

- **Response (200 OK)**:
```json
{
  "status": "UP",
  "timestamp": "2026-09-16T07:40:00.000Z",
  "serverInfo": {
    "hostname": "ip-10-0-10-45.ec2.internal",
    "platform": "linux",
    "uptime": 1240.5,
    "environment": "production"
  }
}
```

---

## 🛍️ 2. Product Management APIs

### 1. ➕ Tạo Sản Phẩm Mới (Add Product)
- **Endpoint**: `POST /api/products`
- **Request Body**:
```json
{
  "name": "iPhone 15 Pro Max",
  "price": 32990000,
  "description": "Điện thoại Apple iPhone 15 Pro Max 256GB Titan Tự Nhiên",
  "stock": 50,
  "category": "Smartphones"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "iPhone 15 Pro Max",
    "price": 32990000,
    "description": "Điện thoại Apple iPhone 15 Pro Max 256GB Titan Tự Nhiên",
    "stock": 50,
    "category": "Smartphones",
    "created_at": "2026-09-16T07:40:00.000Z"
  },
  "nodeInfo": {
    "hostname": "ip-10-0-10-45.ec2.internal"
  }
}
```

---

### 2. 🔍 Tìm Kiếm Sản Phẩm (Search Product)
- **Endpoint**: `GET /api/products/search?name={keyword}`
- **Query Parameters**:
  - `name` (string, required): Từ khóa tên sản phẩm (VD: `iphone`).
- **Response (200 OK)**:
```json
{
  "success": true,
  "total": 1,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "price": 32990000,
      "description": "Điện thoại Apple iPhone 15 Pro Max 256GB Titan Tự Nhiên",
      "stock": 50,
      "category": "Smartphones",
      "created_at": "2026-09-16T07:40:00.000Z"
    }
  ],
  "nodeInfo": {
    "hostname": "ip-10-0-10-88.ec2.internal"
  }
}
```

---

### 3. 📋 Lấy Danh Sách Toàn Bộ Sản Phẩm (View Products)
- **Endpoint**: `GET /api/products`
- **Response (200 OK)**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "price": 32990000,
      "stock": 50,
      "category": "Smartphones"
    },
    {
      "id": 2,
      "name": "MacBook Pro M3",
      "price": 45990000,
      "stock": 20,
      "category": "Laptops"
    }
  ],
  "nodeInfo": {
    "hostname": "ip-10-0-10-45.ec2.internal"
  }
}
```

---

### 4. ✏️ Cập Nhật Sản Phẩm (Edit Product)
- **Endpoint**: `PUT /api/products/:id`
- **Request Body**:
```json
{
  "price": 30990000,
  "stock": 45
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "nodeInfo": {
    "hostname": "ip-10-0-10-45.ec2.internal"
  }
}
```

---

### 5. 🗑️ Xóa Sản Phẩm (Delete Product)
- **Endpoint**: `DELETE /api/products/:id`
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "nodeInfo": {
    "hostname": "ip-10-0-10-88.ec2.internal"
  }
}
```

---

## ❌ HTTP Status Codes Trả Về

- `200 OK`: Truy vấn hoặc xử lý thành công.
- `201 Created`: Tạo dữ liệu sản phẩm mới thành công.
- `400 Bad Request`: Thiếu các tham số bắt buộc (`name`, `price`).
- `404 Not Found`: Không tìm thấy ID sản phẩm tương ứng.
- `500 Internal Server Error`: Lỗi kết nối Database RDS hoặc lỗi logic server.
