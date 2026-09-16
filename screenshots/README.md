# 📸 Danh Sách Ảnh Chụp Màn Hình Cần Có Trong Báo Cáo Đồ Án

Để báo cáo đồ án Điện toán Đám mây đạt điểm tối đa, bạn nên chụp lại các hình ảnh thực tế từ **AWS Console** và **Giao diện Web App** rồi lưu vào thư mục `screenshots/` này:

---

## 🖼️ 1. Giao Diện Web App

- `01-home-page.png`: Trang chủ hiển thị danh sách sản phẩm & Badge Hostname EC2 Node.
- `02-add-product.png`: Trang/Modal thêm sản phẩm thành công.
- `03-search-product.png`: Trang kết quả tìm kiếm sản phẩm theo từ khóa (VD: `iphone`).

---

## ☁️ 2. Hạ Tầng AWS Console (Được Tạo Bởi Terraform)

- `04-aws-vpc.png`: Sơ đồ VPC `cloudautoscale-vpc` kèm các Public và Private Subnets.
- `05-aws-rds.png`: Trạng thái Database AWS RDS MySQL đang `Available` trong Private Subnet.
- `06-aws-alb.png`: Trang cấu hình Application Load Balancer kèm Target Group `Healthy`.
- `07-aws-asg-initial.png`: Auto Scaling Group ban đầu chỉ có **1 EC2 instance** `InService`.

---

## 🚀 3. Thực Nghiệm Load Test & Auto Scaling

- `08-k6-running.png`: Màn hình Terminal chạy script `k6 run test.js` hiển thị thông số VUs & HTTP Request Duration.
- `09-cloudwatch-cpu-spike.png`: Biểu đồ CloudWatch `CPUUtilization` vọt qua mốc 70%.
- `10-cloudwatch-alarm-high.png`: Trạng thái CloudWatch Alarm `HighCPU-ScaleOut` chuyển sang màu đỏ (`ALARM`).
- `11-aws-asg-scale-out.png`: Auto Scaling Group tự động tạo mới **3 EC2 instances** cùng lúc để gánh tải.
- `12-aws-asg-scale-in.png`: Auto Scaling Group tự động gỡ bỏ EC2 dư thừa về mốc 1 máy chủ khi dừng k6.
