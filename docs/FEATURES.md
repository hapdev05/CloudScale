# ✨ CloudAutoScale - Danh Sách & Mô Tả Tính Năng (Project Features)

Tài liệu này tổng hợp toàn bộ các tính năng của dự án **CloudAutoScale**, phân chia theo 3 nhóm cốt lõi: **Tính Năng Web App**, **Tính Năng Cloud & Hạ Tầng**, và **Tính Năng Thử Nghiệm Tải (Load Testing)**.

---

## 🌐 1. Nhóm Tính Năng Web Application

Dự án cung cấp giao diện quản lý sản phẩm hoàn chỉnh, thân thiện và đáp ứng đầy đủ yêu cầu thao tác CRUD dữ liệu:

### 1.1. Tính Năng Bắt Buộc (Core Features)

#### 1. ➕ Thêm Sản Phẩm (Add Product)
- **Mô tả**: Cho phép người dùng nhập thông tin sản phẩm mới bao gồm: Tên sản phẩm, Giá (VND/USD), Số lượng tồn kho, Mô tả chi tiết và Danh mục.
- **Luồng xử lý**: 
  - Form validation phía Client -> Gửi `POST /api/products`.
  - Backend kiểm tra tính hợp lệ của dữ liệu và ghi vào bảng `products` trên **AWS RDS MySQL**.
  - Hiển thị thông báo Toast / Banner thành công trên giao diện.

#### 2. 🔍 Tìm Kiếm Sản Phẩm (Search Product)
- **Mô tả**: Tìm kiếm nhanh các sản phẩm theo từ khóa tên sản phẩm.
- **Luồng xử lý**:
  - Người dùng nhập từ khóa (VD: `iphone`, `macbook`) -> Gửi `GET /api/products/search?name=iphone`.
  - Backend thực hiện câu lệnh SQL: `SELECT * FROM products WHERE name LIKE '%iphone%'`.
  - Trả về danh sách kết quả phù hợp nhất dạng Card/Bảng.

---

### 1.2. Tính Năng Mở Rộng Demo (Enhanced Application Features)

#### 3. 📋 Xem Danh Sách Sản Phẩm (View Products)
- **Mô tả**: Trình bày danh sách toàn bộ sản phẩm có trong hệ thống dạng Lưới (Grid) hiện đại.
- **Bổ sung**: Tự động hiển thị thời gian khởi tạo và số lượng hàng trong kho.

#### 4. ✏️ Chỉnh Sửa Sản Phẩm (Edit Product)
- **Mô tả**: Cho phép thay đổi thông tin giá, tên hoặc số lượng sản phẩm theo ID.

#### 5. 🗑️ Xóa Sản Phẩm (Delete Product)
- **Mô tả**: Loại bỏ sản phẩm khỏi cơ sở dữ liệu với hộp thoại xác nhận (Modal Confirm).

#### 6. 🏷️ Server Node Indicator Badge (Tính Năng Chứng Minh Cân Bằng Tải)
- **Mô tả**: Tại góc giao diện của ứng dụng, luôn có một Badge hiển thị thông tin:
  - `Server Hostname`: Tên máy chủ EC2 vừa phản hồi request (VD: `ip-10-0-10-45.ec2.internal`).
  - `Server IP / Zone`: Vùng khả dụng (AZ) của máy chủ.
- **Mục đích**: Giúp người dùng/giảng viên nhận biết rõ rệt rằng **Application Load Balancer (ALB)** đang phân phối luân phiên các request tới các máy chủ EC2 khác nhau khi nhấn Refresh hoặc gọi API.

---

## ☁️ 2. Nhóm Tính Năng Cloud & Hạ Tầng (Trọng Tâm Đồ Án)

Đây là các tính năng cốt lõi thể hiện đúng nội dung môn học Điện toán Đám mây:

### 2.1. AWS RDS MySQL (Relational Database Service)
- **Điểm nổi bật**: Database được đặt hoàn toàn trong Private Subnet, cách ly hoàn toàn với Internet.
- **Quản lý kết nối**: Node.js Backend sử dụng Connection Pool để tối ưu số lượng kết nối tới RDS.

### 2.2. EC2 Auto Scaling Group (ASG)
- **Tự động mở rộng (Scale-out)**: Khi CPU trung bình > 70%, tự động thêm 1-2 máy chủ EC2 mới.
- **Tự động thu hẹp (Scale-in)**: Khi CPU trung bình < 30%, tự động tiêu hủy các EC2 thừa về lại mốc ban đầu (1 EC2).
- **Phân bố Multi-AZ**: Máy chủ EC2 được phân bố đều ở ít nhất 2 Availability Zones (`ap-southeast-1a` và `ap-southeast-1b`) giúp hệ thống tiếp tục hoạt động ngay cả khi một datacenter của AWS gặp sự cố.

### 2.3. Application Load Balancer (ALB)
- **Cân bằng tải lớp 7**: Phân phối đều HTTP Traffic tới cụm máy chủ EC2 Backend.
- **Tự động gỡ máy chủ lỗi (Health Check)**: Khi một máy chủ EC2 hỏng, ALB phát hiện qua endpoint `/healthcheck` và dừng chuyển traffic tới máy chủ đó.

### 2.4. Infrastructure as Code (Terraform)
- Toàn bộ 100% tài nguyên đám mây (VPC, Subnet, Route Table, Internet Gateway, Security Group, ALB, Target Group, Launch Template, ASG, RDS, CloudWatch Alarms) được mã hóa bằng tệp tin ngôn ngữ HCL trong thư mục `terraform/`.
- Khởi tạo toàn bộ hệ thống chỉ bằng câu lệnh: `terraform apply`.

---

## 🚀 3. Nhóm Tính Năng Load Testing & Đánh Giá Hiệu Năng

### 3.1. Kịch Bản Tạo Tải Giả Lập (k6 Script)
- **Ramping VUs Test**: Tăng số lượng người dùng ảo (Virtual Users) theo từng giai đoạn:
  - 0s - 30s: 50 VUs (Tải bình thường).
  - 30s - 2m: Tăng tốc lên 200 VUs (Tải bắt đầu cao).
  - 2m - 5m: Duy trì 500 VUs (Tải đột biến đỉnh điểm).
  - 5m - 6m: Giảm về 0 VUs (Hạ tải).

### 3.2. Giám Sát Chi Tiết Trên AWS CloudWatch
- Dashboard hiển thị các biểu đồ:
  - `CPUUtilization` trung bình của Auto Scaling Group.
  - `RequestCountPerTarget` (Số request nhận được tại mỗi máy chủ EC2).
  - `GroupInServiceInstances` (Số máy chủ EC2 đang thực sự chạy).

---

## 📊 4. Tổng Kết Bảng Tính Năng Đề Xuất Cho Đồ Án Môn Học

| Phân Loại | Tính Năng | Thể Hiện Trên Demo | Giá Trị Báo Cáo |
|---|---|---|---|
| **Web** | Add & Search Product | Form nhập dữ liệu & Thanh tìm kiếm tức thì | Đáp ứng yêu cầu ứng dụng |
| **Web** | EC2 Node Badge | Hiển thị Hostname EC2 tại Footer/Header | Chứng minh ALB chia tải thành công |
| **Cloud** | Terraform IaC | File `.tf` tạo toàn bộ hạ tầng AWS | Thể hiện tư duy DevOps & Cloud Native |
| **Cloud** | ALB + ASG Multi-AZ | Tải tăng -> Số EC2 tăng từ 1 lên 3 | Chứng minh tính Elasticity & High Availability |
| **Testing**| k6 Load Test | Biểu đồ CloudWatch CPU vọt lên > 70% | Có số liệu thực nghiệm làm biểu đồ báo cáo |
