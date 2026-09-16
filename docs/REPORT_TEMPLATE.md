# 📄 Mẫu Dàn Ý Báo Cáo Đồ Án Môn Học Điện Toán Đám Mây

**Tên Đề Tài**: Developing and Testing a Cloud-Based Web Application with Auto Scaling and Load Balancing  
**Tên Dự Án**: **CloudAutoScale**  
**Giảng Viên Hướng Dẫn**: [Điền tên Giảng viên]  
**Sinh Viên Thực Hiện**: [Điền tên Sinh viên / Nhóm]  

---

## MỤC LỤC BÁO CÁO

### CHƯƠNG 1: GIỚI THIỆU ĐỀ TÀI & MỤC TIÊU
1.1. Đặt vấn đề & Lý do chọn đề tài (Tính cấp thiết của Auto Scaling & Load Balancing trên Cloud).  
1.2. Mục tiêu nghiên cứu & Sản phẩm đạt được.  
1.3. Phạm vi đề tài (Tập trung vào AWS RDS, EC2, ALB, Auto Scaling Group, CloudWatch và IaC Terraform).  

### CHƯƠNG 2: TỔNG QUAN CÔNG NGHỆ SỬ DỤNG
2.1. Công nghệ Web: Next.js 14 (App Router), Node.js, Express.js.  
2.2. Dịch vụ Đám mây AWS:
- AWS VPC & Subnets (Phân vùng Public/Private).
- AWS EC2 & Launch Template.
- AWS Application Load Balancer (ALB).
- AWS Auto Scaling Group (ASG) & Scaling Policies.
- AWS RDS MySQL (Cơ sở dữ liệu đám mây).
- AWS CloudWatch (Cảnh báo & Giám sát CPU).
2.3. Công nghệ Hạ tầng dạng mã (IaC): Terraform.  
2.4. Công nghệ Kiểm thử tải: k6 Load Testing.  

### CHƯƠNG 3: THIẾT KẾ KIẾN TRÚC HỆ THỐNG & DỮ LIỆU
3.1. Thiết kế kiến trúc tổng quan 3 lớp (3-Tier Cloud Architecture).  
3.2. Thiết kế luồng xử lý dữ liệu & request HTTP (Request Lifecycle).  
3.3. Thiết kế Security Groups & Quy tắc phân vùng bảo mật.  
3.4. Thiết kế Cơ sở dữ liệu MySQL trên AWS RDS.  
3.5. Thiết kế RESTful API Specs.  

### CHƯƠNG 4: TRIỂN KHAI & THỰC NGHIỆM (DEMO)
4.1. Mã hóa hạ tầng đám mây với Terraform (`terraform/`).  
4.2. Khởi tạo và kiểm tra trạng thái các dịch vụ trên AWS Console.  
4.3. Demo tính năng Web App (Thêm sản phẩm, Tìm kiếm sản phẩm, Node Indicator Badge).  
4.4. Thực nghiệm Kịch bản Load Test với k6.  
4.5. Phân tích kết quả Tự động Mở rộng (Scale-out) & Thu hẹp (Scale-in).  

### CHƯƠNG 5: KẾT LUẬN & HƯỚNG PHÁT TRIỂN
5.1. Kết quả đạt được so với mục tiêu ban đầu.  
5.2. Ưu điểm & Hạn chế của hệ thống.  
5.3. Hướng phát triển mở rộng (Bổ sung Redis Cache, CI/CD Pipeline với GitHub Actions, CloudFront CDN).  
