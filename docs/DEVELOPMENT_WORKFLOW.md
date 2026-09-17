# 📖 Hướng Dẫn Vận Hành & Phát Triển Dự Án CloudAutoScale

Tài liệu này tổng hợp toàn bộ quy trình chạy local, cập nhật code Backend/Frontend, triển khai lên AWS Cloud, quản lý chi phí 0đ và chạy k6 Load Test cho dự án **CloudAutoScale**.

---

## 🛠️ 1. Quy Trình Chạy & Test Dưới Máy Local (Local Development)

Khi phát triển tính năng mới tại máy local (VS Code):

### 🔹 Terminal 1: Chạy Backend (Node.js + Express)
```bash
cd backend
npm install
npm run dev
# Server chạy tại: http://localhost:5000
```
- Kết nối tới MySQL local với các thông số trong tệp `backend/.env`.

### 🔹 Terminal 2: Chạy Frontend (Next.js 14)
```bash
cd frontend
npm install
npm run dev
# Giao diện chạy tại: http://localhost:3000
```
- Mở trình duyệt `http://localhost:3000` để thao tác Xem, Thêm và Tìm kiếm sản phẩm.

---

## 🔄 2. Quy Trình Cập Nhật Code Backend & Triển Khai Lên AWS Cloud

Khi bạn chỉnh sửa code trong thư mục `backend/` (ví dụ: sửa API, thêm logic):

### Bước 1: Viết Code & Đẩy Lên GitHub
```bash
# 1. Thêm và commit code thay đổi
git add .
git commit -m "Cập nhật tính năng Backend mới"

# 2. Đẩy code lên GitHub repository
git push origin main
```

### Bước 2: Báo Cho AWS EC2 Kéo Code Mới Về Chạy
Mở Terminal `terraform/` và chạy 2 câu lệnh:

```bash
cd terraform

# 1. Cập nhật Launch Template (nếu có thay đổi)
terraform apply -auto-approve

# 2. Hủy máy chủ EC2 cũ để Auto Scaling tự đẻ máy chủ EC2 mới kéo code mới từ GitHub về
aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --query "Reservations[*].Instances[?State.Name=='running'].InstanceId" --output text)
```

---

## 💵 3. Quy Trình Tạm Dừng Hạ Tầng Để NGẮT TÍNH TIỀN 0đ (AWS Cost Control)

Trong môi trường AWS Cloud, **Application Load Balancer (ALB)** và **AWS RDS** bị tính phí duy trì theo giờ.

### 🛑 Tạm dừng hệ thống khi không dùng (Ngắt phí 0đ):
Sau khi học xong hoặc demo xong, mở Terminal `terraform/` và gõ:

```bash
cd terraform
terraform destroy -auto-approve
```
- **Tác dụng**: Xóa 100% tài nguyên đã tạo trên AWS. Tài khoản của bạn **không bị trừ 1 xu chi phí nào**.
- **An toàn**: Toàn bộ cấu hình hạ tầng đã được lưu an toàn tuyệt đối trong mã nguồn `.tf`.

### 🔄 Khôi phục hệ thống khi cần học tiếp hoặc BẢO VỆ ĐỒ ÁN:
Đến ngày bảo vệ đồ án trước hội đồng, bạn chỉ cần mở Terminal gõ:

```bash
cd terraform
terraform apply -auto-approve
```
- **Tác dụng**: Terraform tự động dựng lại 100% hạ tầng AWS hoàn chỉnh như cũ trong 3 – 5 phút.

---

## 🚀 4. Quy Trình Thực Nghiệm Load Test k6 (Demo Auto Scaling)

Sau khi triển khai hạ tầng thành công với `terraform apply`:

### Bước 1: Lấy URL ALB DNS
```bash
cd terraform
terraform output alb_dns_name
# Ví dụ: cloudautoscale-alb-765825387.ap-southeast-1.elb.amazonaws.com
```

### Bước 2: Chạy k6 Load Test Tạo Tải Nặng
Mở terminal `load-test/` và truyền URL ALB:

```bash
cd load-test
k6 run -e TARGET_URL=http://<ĐỊA_CHỈ_ALB_DNS_CỦA_BẠN> test.js
```

### Bước 3: Quan Sát Kết Quả Đồ Án
1. **AWS CloudWatch Console**:
   - Vùng chọn: **Singapore (`ap-southeast-1`)**.
   - Cảnh báo **`cloudautoscale-HighCPU-ScaleOut`** sẽ tự chuyển từ màu xanh `OK` ➔ **Màu đỏ `In alarm`**.
2. **AWS EC2 Console**:
   - Số lượng máy chủ EC2 tự động tăng từ **1 EC2 ➔ 3 EC2** để gánh tải.

---

## 🔑 5. Truy Cập SSH Vào EC2 & Quản Lý Database RDS MySQL

Khi cần debug, kiểm tra log hoặc quản lý dữ liệu trực tiếp trên AWS:

### Bước 1: Lấy IP của EC2 đang chạy
```bash
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=cloudautoscale-backend-node" "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].[InstanceId,PublicIpAddress]" \
  --output table --region ap-southeast-1
```

### Bước 2: SSH vào EC2
```bash
ssh -i ~/.ssh/cloudautoscale-key.pem ubuntu@<IP_CỦA_EC2>
```

### Bước 3: Kiểm tra log trên EC2
```bash
# Xem log quá trình khởi tạo EC2 (user-data script)
cat /var/log/user-data.log

# Xem log Backend App
cat /home/ubuntu/app/backend/app.log

# Kiểm tra Backend có đang chạy không
ps aux | grep node
```

### Bước 4: Truy cập RDS MySQL từ EC2
```bash
# Cài MySQL client (lần đầu)
sudo apt-get install -y mysql-client

# Kết nối vào RDS MySQL
mysql -h cloudautoscale-db.cjwywm08ujzz.ap-southeast-1.rds.amazonaws.com \
      -u admin \
      -p'CloudAutoScaling2026Secured!' \
      cloudautoscale_db
```

### Các lệnh MySQL hữu ích:
```sql
-- Xem danh sách tables
SHOW TABLES;

-- Xem dữ liệu sản phẩm
SELECT * FROM products;

-- Xem dung lượng Database
SELECT table_name,
       ROUND(data_length/1024/1024, 2) AS 'Data (MB)',
       ROUND(index_length/1024/1024, 2) AS 'Index (MB)'
FROM information_schema.tables
WHERE table_schema = 'cloudautoscale_db';

-- Xóa toàn bộ dữ liệu (reset DB)
TRUNCATE TABLE products;
```

> **⚠️ Lưu ý**: RDS nằm trong **Private Subnet** → chỉ truy cập được từ EC2 (cùng VPC), **không** truy cập trực tiếp từ máy local.

---

## 📂 6. Bảng Tóm Tắt Các Câu Lệnh Thường Dùng

| Thao Tác | Câu Lệnh | Thư Mục Chạy |
|---|---|---|
| **Chạy Frontend Local** | `npm run dev` | `frontend/` |
| **Chạy Backend Local** | `npm run dev` | `backend/` |
| **Đẩy Code Lên GitHub** | `git add . && git commit -m "..." && git push origin main` | Thư mục gốc |
| **Tạo Hạ Tầng AWS** | `terraform apply -auto-approve` | `terraform/` |
| **Hủy Hạ Tầng Ngắt Phí**| `terraform destroy -auto-approve` | `terraform/` |
| **Reset EC2 Kéo Code Mới**| `aws ec2 terminate-instances --instance-ids $(aws ec2 describe-instances --query "Reservations[*].Instances[?State.Name=='running'].InstanceId" --output text)` | Bất kỳ |
| **SSH vào EC2** | `ssh -i ~/.ssh/cloudautoscale-key.pem ubuntu@<IP>` | Bất kỳ |
| **Kết nối RDS MySQL** | `mysql -h <RDS_ENDPOINT> -u admin -p cloudautoscale_db` | Trong SSH EC2 |
| **Chạy Load Test** | `k6 run -e TARGET_URL=http://<ALB-DNS> test.js` | `load-test/` |

