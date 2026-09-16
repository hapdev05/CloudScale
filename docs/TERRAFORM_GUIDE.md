# 📜 CloudAutoScale - Hướng Dẫn Triển Khai Hạ Tầng Bằng Terraform (IaC Guide)

Tài liệu hướng dẫn khởi tạo, quản lý và hủy toàn bộ hạ tầng đốm mây trên **AWS** sử dụng **Terraform** (Infrastructure as Code).

---

## 🛠️ 1. Yêu Cầu Tiền Đề (Prerequisites)

Trước khi thực thi Terraform, bạn cần chuẩn bị:
1. **AWS CLI** đã được cài đặt và cấu hình credentials:
   ```bash
   aws configure
   # Nhập AWS Access Key ID, Secret Access Key, Default region (VD: ap-southeast-1)
   ```
2. **Terraform CLI** (phiên bản `>= 1.0.0`):
   ```bash
   terraform -version
   ```

---

## 📂 2. Danh Sách Các Tệp Terraform & Chức Năng

| Tệp Tin | Vai Trò & Chức Năng |
|---|---|
| `provider.tf` | Khai báo AWS Provider, yêu cầu phiên bản Terraform và Region triển khai (`ap-southeast-1`) |
| `variables.tf` | Định nghĩa các biến tùy chỉnh: Tên môi trường, CIDR blocks, Instance Type, DB credentials |
| `vpc.tf` | Tạo VPC (`10.0.0.0/16`), 2 Public Subnets, 2 Private Subnets App, 2 Private Subnets DB, Internet Gateway, Route Tables |
| `security-group.tf` | Tạo 3 lớp Security Groups: `alb-sg` (Port 80), `ec2-sg` (Port 5000), `rds-sg` (Port 3306) |
| `rds.tf` | Khởi tạo AWS RDS MySQL (`db.t3.micro`, Subnet Group private, ngắt kết nối Public) |
| `launch-template.tf` | Tạo Launch Template chứa script `user-data.sh` tự động pull code Backend, cài Node.js & chạy PM2 |
| `load-balancer.tf` | Tạo Application Load Balancer (ALB), Listener (Port 80) và Target Group (Port 5000) |
| `auto-scaling.tf` | Tạo Auto Scaling Group (ASG) liên kết ALB Target Group; định nghĩa min=1, max=4 |
| `cloudwatch.tf` | Khởi tạo CloudWatch Alarms: High CPU Alarm (>70%) và Low CPU Alarm (<30%) |
| `outputs.tf` | Xuất thông tin quan trọng sau khi apply: ALB DNS Name, RDS Endpoint |

---

## 🚀 3. Quy Trình 4 Bước Triển Khai Hạ Tầng

Mở **Terminal 3** trong VS Code tại thư mục `terraform/`:

```bash
cd terraform
```

### Bước 1: Khởi Tạo Terraform (Initialize)
Tải AWS Provider plugin và khởi tạo workspace:
```bash
terraform init
```

### Bước 2: Kiểm Tra Kế Hoạch Thay Đổi (Plan)
Kiểm tra danh sách tài nguyên AWS sẽ được khởi tạo:
```bash
terraform plan
```

### Bước 3: Áp Dụng Triển Khai Hạ Tầng (Apply)
Khởi tạo thực sự toàn bộ hạ tầng trên AWS Console:
```bash
terraform apply -auto-approve
```
*Thời gian hoàn tất trung bình từ 3 đến 5 phút (chủ yếu do AWS RDS MySQL khởi tạo).*

### Bước 4: Kiểm Tra Đầu Ra (Outputs)
Sau khi hoàn thành, màn hình sẽ hiển thị:
```text
Outputs:

alb_dns_name = "cloudautoscale-alb-123456789.ap-southeast-1.elb.amazonaws.com"
rds_endpoint = "cloudautoscale-db.c123456789.ap-southeast-1.rds.amazonaws.com:3306"
```

---

## ⚠️ 4. Hướng Dẫn Dọn Dẹp Tài Nguyên Chi Phí (Destroy)

Sau khi hoàn thành bài báo cáo/demo đồ án, hãy **bắt buộc** chạy lệnh sau để hủy toàn bộ tài nguyên nhằm tránh phát sinh chi phí trên tài khoản AWS:

```bash
terraform destroy -auto-approve
```
