# ☁️ CloudAutoScale

> **Developing and Testing a Cloud-Based Web Application with Auto Scaling and Load Balancing**
> 
> *Đồ án Điện toán Đám mây (Cloud Computing Project) - Xây dựng và Thực nghiệm Ứng dụng Web trên AWS với Tự động Mở rộng (Auto Scaling) và Cân bằng Tải (Load Balancing).*

---

## 📌 1. Giới Thiệu Dự Án (Project Overview)

**CloudAutoScale** là một dự án mẫu chuẩn dành cho môn học Điện toán Đám mây. Mục tiêu cốt lõi của dự án là minh họa khả năng chịu tải, phân phối lưu lượng và tự động mở rộng/thu hẹp tài nguyên (Elasticity & High Availability) của hạ tầng đốm mây AWS khi ứng dụng web chịu tải đột biến.

Dự án được thiết kế theo mô hình 3 lớp (**3-Tier Architecture**):
- **Frontend**: Giao diện người dùng web (Next.js 14 / App Router).
- **Backend**: RESTful API service (Node.js + Express).
- **Database**: Cơ sở dữ liệu MySQL lưu trữ trên AWS RDS (Relational Database Service).
- **Infrastructure as Code (IaC)**: Khởi tạo toàn bộ hạ tầng AWS tự động bằng **Terraform**.
- **Load Testing**: Giả lập tải người dùng cao bằng **k6 / JMeter** để kích hoạt AWS Auto Scaling.

---

## 📂 2. Cấu Trúc Dự Án (Project Directory Structure)

Dự án được tổ chức theo từng mô-đun độc lập, giúp dễ quản lý mã nguồn, triển khai hạ tầng và viết báo cáo đồ án:

```text
cloud-auto-scaling-project/
│
├── frontend/                 # 💻 Giao diện ứng dụng Web (Next.js 14 / App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx        # Root Layout & Styling
│   │   │   ├── globals.css       # Design System & Custom Styling
│   │   │   ├── page.jsx          # Trang chủ / Danh sách sản phẩm & EC2 Node Badge
│   │   │   ├── add-product/
│   │   │   │   └── page.jsx      # Trang thêm sản phẩm mới
│   │   │   └── search/
│   │   │       └── page.jsx      # Trang tìm kiếm sản phẩm theo tên
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Thanh điều hướng với Next.js Link
│   │   │   └── NodeBadge.jsx     # Badge hiển thị thông tin Hostname EC2 Node
│   │   └── services/
│   │       └── api.js            # Axios client gọi HTTP API tới Backend/ALB
│   ├── package.json
│   └── next.config.mjs
│
├── backend/                  # ⚙️ RESTful API Server (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js   # Cấu hình kết nối MySQL trên AWS RDS
│   │   ├── controllers/
│   │   │   └── productController.js # Xử lý logic nghiệp vụ Sản phẩm
│   │   ├── routes/
│   │   │   └── productRoutes.js     # Định tuyến API (POST, GET, PUT, DELETE)
│   │   └── server.js         # Khởi tạo server & API Healthcheck (xác định Hostname/IP)
│   ├── package.json
│   └── .env.example
│
├── terraform/                # 🏗️ Mã nguồn khởi tạo hạ tầng AWS (IaC)
│   ├── provider.tf           # Khai báo AWS Provider & Region
│   ├── variables.tf          # Các biến cấu hình (DB pass, EC2 type, Key Pair)
│   ├── vpc.tf                # VPC, Public/Private Subnets, Internet Gateway
│   ├── security-group.tf     # Cấu hình Security Group cho ALB, EC2, RDS
│   ├── rds.tf                # Khởi tạo AWS RDS MySQL Instance
│   ├── launch-template.tf    # EC2 Launch Template (User Data cài đặt Backend)
│   ├── load-balancer.tf      # Application Load Balancer (ALB) & Target Group
│   ├── auto-scaling.tf       # Auto Scaling Group (ASG) & Scaling Policies
│   ├── cloudwatch.tf         # CloudWatch Alarms theo dõi CPU Utilization
│   └── outputs.tf            # Xuất URL ALB DNS, Endpoint RDS
│
├── load-test/                # 🚀 Script tạo tải giả lập người dùng
│   └── test.js               # Kịch bản Load Test sử dụng k6
│
├── docs/                     # 📚 Tài liệu chi tiết dự án
│   ├── DEVELOPMENT_WORKFLOW.md# Hướng dẫn chi tiết vận hành & phát triển
│   ├── ARCHITECTURE.md       # Chi tiết kiến trúc & luồng xử lý
│   ├── FEATURES.md           # Chi tiết các tính năng Web, Cloud & Testing
│   ├── API_DOCUMENTATION.md  # Tài liệu RESTful API
│   ├── TERRAFORM_GUIDE.md    # Hướng dẫn chạy Terraform
│   └── LOAD_TESTING_GUIDE.md # Hướng dẫn thực nghiệm Load Test & Auto Scaling
│
├── screenshots/              # 📸 Thư mục lưu hình ảnh minh họa cho báo cáo
│   └── README.md             # Danh sách ảnh chụp cần có trên AWS Console
│
└── README.md                 # Tài liệu tổng quan dự án
```

---

## 🔄 3. Cấu Trúc Luồng Xử Lý Dự Án (Processing & Traffic Flow)

### 3.1. Sơ Đồ Tổng Quan Kiến Trúc (Architecture Diagram)

```text
                           ┌─────────────────────────┐
                           │      User / Browser     │
                           └────────────┬────────────┘
                                        │
                                        │ HTTP Request (Port 80)
                                        ▼
                           ┌─────────────────────────┐
                           │ Application Load        │
                           │ Balancer (ALB)          │
                           └────────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │ Round-Robin /            │ Round-Robin /            │ Round-Robin /
             │ Least Connections        │ Least Connections        │ Least Connections
             ▼                          ▼                          ▼
  ┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
  │   EC2 Backend #1    │    │   EC2 Backend #2    │    │   EC2 Backend #3    │
  │  (Node.js + Express)│    │  (Node.js + Express)│    │  (Node.js + Express)│
  └──────────┬──────────┘    └──────────┬──────────┘    └──────────┬──────────┘
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        │ SQL Query (Port 3306)
                                        ▼
                           ┌─────────────────────────┐
                           │      AWS RDS MySQL      │
                           │   (Private Subnet)      │
                           └─────────────────────────┘
```

### 3.2. Luồng Xử Lý Chi Tiết (Detailed Step-by-Step Flow)

#### 1. Luồng Người Dùng & Truy Vấn Dữ Liệu (Request Lifecycle):
1. **Khởi tạo Request**: Người dùng tương tác trên Frontend React (VD: Nhấn "Thêm sản phẩm" hoặc tìm kiếm "iphone").
2. **Gửi HTTP Request**: Frontend gửi request HTTP (`POST /api/products` hoặc `GET /api/products/search?name=iphone`) tới **Application Load Balancer (ALB)** qua địa chỉ Public DNS Domain của ALB.
3. **Cân Bằng Tải (Load Balancing)**:
   - ALB tiếp nhận request và phân phối lưu lượng (mô hình Round-Robin) tới một trong các instance **EC2 Backend** khả dụng nằm trong **Target Group**.
   - Mỗi EC2 Backend chạy một tiến trình Node.js Express server độc lập.
4. **Xử lý Logic & Kết nối Database**:
   - Backend EC2 nhận request, thực hiện validation dữ liệu.
   - Kết nối tới **AWS RDS MySQL** (đặt tại Private Subnet bảo mật) thông qua đường kết nối nội bộ VPC để thực hiện truy vấn SQL (`INSERT`, `SELECT`).
5. **Phản Hồi (Response)**:
   - RDS trả dữ liệu kết quả về EC2 Backend.
   - EC2 Backend bổ sung metadata (bao gồm `Hostname` / `Instance-ID` của EC2 để nhận biết node xử lý) và trả JSON response về ALB -> Frontend.
   - Frontend hiển thị thông tin dữ liệu và tên Server EC2 vừa xử lý lên giao diện.

#### 2. Luồng Tự Động Mở Rộng Hạ Tầng (Auto Scaling Flow):
```text
  [ k6 Load Test ]  ──> Gửi 200-500 VUs Request dồn dập tới ALB
                                 │
                                 ▼
                     [ CPU EC2 tăng > 70% ]
                                 │
                                 ▼
                     [ CloudWatch Alarm kích hoạt ]
                                 │
                                 ▼
                     [ Auto Scaling Policy Scale-out ]
                                 │
                                 ▼
                     [ Tạo mới EC2 Backend #2, #3 ]
                                 │
                                 ▼
                 [ Đăng ký EC2 mới vào ALB Target Group ]
```
1. **Giám sát CPU (Monitoring)**: AWS **CloudWatch Alarm** liên tục kiểm tra chỉ số `CPUUtilization` trung bình của Auto Scaling Group theo mỗi 60 giây.
2. **Kích hoạt Scale-Out (Tải Cao)**: Khi k6 tạo tải cao khiến `CPUUtilization > 70%` trong 2 phút liên tiếp:
   - CloudWatch gửi cảnh báo (Alarm) tới Auto Scaling Group.
   - Auto Scaling Group sử dụng **Launch Template** để tự động khởi tạo thêm các máy chủ EC2 mới (VD: Tăng từ 1 EC2 -> 2 EC2 -> 3 EC2).
   - Ngay khi EC2 mới đi vào trạng thái `InService` và vượt qua bước **Health Check**, ALB tự động thêm EC2 mới vào danh sách chia tải.
3. **Kích hoạt Scale-In (Tải Giảm)**: Khi dừng Load Test, `CPUUtilization < 30%`:
   - CloudWatch Alarm gửi tín hiệu hạ tải.
   - Auto Scaling Group tự động gỡ bỏ các máy chủ EC2 thừa (Thu hẹp từ 3 EC2 -> 2 EC2 -> 1 EC2), giúp tiết kiệm tối đa chi phí đám mây.

---

## ✨ 4. Danh Sách Tính Năng Hoàn Chỉnh (Complete Features)

Dự án được chia làm 3 nhóm tính năng trọng tâm: **Web Application**, **Cloud Infrastructure**, và **Load Testing & Monitoring**.

### 4.1. Tính Năng Web Application 🌐

| STT | Tính Năng | Mô Tả Chi Tiết | Trạng Thái |
|---|---|---|---|
| 1 | ➕ **Add Product** | Thêm mới sản phẩm (Tên, Giá, Mô tả, Số lượng, Danh mục) vào DB MySQL | **Bắt buộc** |
| 2 | 🔍 **Search Product** | Tìm kiếm sản phẩm theo tên sử dụng câu lệnh SQL `LIKE` | **Bắt buộc** |
| 3 | 📋 **View Products** | Hiển thị danh sách toàn bộ sản phẩm dạng lưới (Grid/Table) kèm phân trang | Mở rộng |
| 4 | ✏️ **Edit Product** | Chỉnh sửa thông tin sản phẩm có sẵn theo `ID` | Mở rộng |
| 5 | 🗑️ **Delete Product** | Xóa sản phẩm khỏi hệ thống | Mở rộng |
| 6 | 🏷️ **Server Node Badge** | Hiển thị tên Instance / Hostname của EC2 đang trực tiếp xử lý request (giúp chứng minh ALB đang cân bằng tải) | **Đặc tả Demo** |

### 4.2. Tính Năng Cloud Hạ Tầng ⭐ (Trọng Tâm Đề Tài)

| STT | Thành Phần AWS | Mô Tả Vai Trò | Cấu Hình |
|---|---|---|---|
| 1 | 🗄️ **AWS RDS MySQL** | Lưu trữ dữ liệu quan hệ trên Cloud. Không cấp IP Public (nằm trong Private Subnet), chỉ cho phép EC2 Backend truy cập port 3306 | MySQL 8.0, db.t3.micro |
| 2 | 💻 **AWS EC2 Backend** | Cụm máy chủ ảo chạy Node.js Backend. Được quản lý bởi Auto Scaling Group | Ubuntu 22.04 LTS, t3.micro |
| 3 | ⚖️ **Application Load Balancer (ALB)** | Nhận traffic duy nhất tại cổng 80, chia đều tải cho các EC2 backend trong Target Group | Public Subnets, Health Check `/healthcheck` |
| 4 | 📈 **Auto Scaling Group** | Tự động điều chỉnh số lượng EC2 backend trong khoảng `Min = 1`, `Desired = 1`, `Max = 4` | Target Tracking Scaling Policy |
| 5 | 🔔 **AWS CloudWatch** | Thu thập chỉ số CPU Utilization, Memory, HTTP Request Count và quản lý Cảnh báo (Alarm) | Metric Alarm: CPU > 70% & CPU < 30% |
| 6 | 📜 **Terraform (IaC)** | Tự động hóa toàn bộ việc tạo VPC, Subnet, Security Group, ALB, EC2, RDS, ASG chỉ bằng 1 câu lệnh | HCL Terraform Version >= 1.0 |

### 4.3. Tính Năng Load Testing & Thực Nghiệm 🚀

- 🛠️ **k6 / JMeter Load Test Script**: Script k6 giả lập tăng dần người dùng truy cập đồng thời từ 50 VUs -> 200 VUs -> 500 VUs.
- 📊 **Kiểm Chứng Scale-Out**: Chứng minh hệ thống tự động spawn thêm máy chủ EC2 khi CPU vượt ngưỡng 70%.
- 📉 **Kiểm Chứng Scale-In**: Chứng minh hệ thống tự động tiêu hủy EC2 khi hết tải để tối ưu chi phí.

---

## 🛠️ 5. Hướng Dẫn Khởi Chạy Dự Án (Quick Start Guide)

Khi phát triển tại máy local (VS Code), bạn mở thư mục gốc:

```bash
code cloud-auto-scaling-project
```

Mở 3 terminal song song:

### 🔹 Terminal 1: Chạy Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
# Frontend sẽ chạy tại: http://localhost:3000
```

### 🔹 Terminal 2: Chạy Backend (Node.js/Express)
```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa thông tin kết nối Database trong .env
npm run dev
# Backend API sẽ chạy tại: http://localhost:5000
```

### 🔹 Terminal 3: Quản Lý Hạ Tầng Đám Mây (Terraform)
```bash
cd terraform
terraform init
terraform plan
terraform apply -auto-approve
# Nhận URL ALB DNS và Endpoint RDS từ output của Terraform!
```

---

## 🔌 6. Danh Sách RESTful API Endpoints

Các API chính được cung cấp bởi Backend Service:

- `GET /healthcheck` - API kiểm tra trạng thái máy chủ & trả về `hostname` của EC2 instance.
- `GET /api/products` - Lấy danh sách toàn bộ sản phẩm.
- `GET /api/products/search?name=iphone` - Tìm kiếm sản phẩm theo từ khóa.
- `POST /api/products` - Tạo mới một sản phẩm.
- `GET /api/products/:id` - Lấy chi tiết một sản phẩm theo ID.
- `PUT /api/products/:id` - Cập nhật sản phẩm theo ID.
- `DELETE /api/products/:id` - Xóa sản phẩm theo ID.

Chi tiết đính kèm tại tệp [docs/API_DOCUMENTATION.md](file:///home/anhphi/Cloud_9/docs/API_DOCUMENTATION.md).

---

## 🧪 7. Chạy Thực Nghiệm Load Test

Sau khi triển khai thành công hạ tầng trên AWS bằng Terraform, lấy **ALB DNS Name** từ đầu ra output của Terraform và tiến hành chạy script k6:

```bash
cd load-test
# Thay đổi URL của ALB vào script test.js
k6 run test.js
```

Quan sát trực quan sự thay đổi CPU trên **AWS CloudWatch Dashboard** và danh sách máy chủ EC2 trên **AWS EC2 Console**. 

Chi tiết kịch bản thực nghiệm đính kèm tại [docs/LOAD_TESTING_GUIDE.md](file:///home/anhphi/Cloud_9/docs/LOAD_TESTING_GUIDE.md).

---

## 💵 8. Quản Lý Chi Phí & Tạm Dừng Hạ Tầng (AWS Cost Management)

Để đảm bảo không bị trừ tiền trên tài khoản AWS cá nhân/học tập khi không sử dụng:

- **🛑 Tạm Dừng Hệ Thống (Ngắt Phí 0đ)**:
  ```bash
  cd terraform
  terraform destroy -auto-approve
  ```
  *Lệnh này đóng vai trò là "nút Pause" giúp dọn dẹp sạch toàn bộ ALB, EC2, RDS để tài khoản không bị phát sinh chi phí. Mã nguồn hạ tầng vẫn được lưu trữ tuyệt đối an toàn trong các tệp `.tf`.*

- **🔄 Khôi Phục Hệ Thống Khi Cần Demo / Bảo Vệ Đồ Án**:
  ```bash
  cd terraform
  terraform apply -auto-approve
  ```
  *Terraform sẽ tự động khôi phục lại 100% hạ tầng chuẩn xác trên AWS chỉ trong 3 - 5 phút.*

---

## 📄 9. Giấy Phép & Tác Giả (License & Authors)

- **Đề tài**: Developing and Testing a Cloud-Based Web Application with Auto Scaling and Load Balancing.
- **Tên dự án ngắn gọn**: **CloudAutoScale**.
- **Giấy phép**: MIT License - Thích hợp cho mục đích học tập, nghiên cứu đồ án môn học Điện toán đám mây.
