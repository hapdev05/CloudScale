# 🚀 CloudAutoScale - Hướng Dẫn Thực Nghiệm Load Test & Auto Scaling

Tài liệu chi tiết hướng dẫn thực hiện tạo tải giả lập bằng **k6**, theo dõi chỉ số hiệu năng trên **AWS CloudWatch** và kiểm chứng cơ chế **Auto Scaling** tự động gia tăng/thu hẹp máy chủ EC2.

---

## 🎯 1. Mục Tiêu Thực Nghiệm

1. Demonstrating **Load Balancing**: Đảm bảo ALB chia đều lưu lượng HTTP cho các máy chủ EC2.
2. Demonstrating **Scale-Out**: Chứng minh rằng khi tải người dùng tăng cao đột biến khiến CPU vượt 70%, Auto Scaling Group tự động tạo mới các máy chủ EC2 (1 EC2 -> 2 EC2 -> 3 EC2).
3. Demonstrating **Scale-In**: Chứng minh rằng khi dừng k6 load test, CPU hạ xuống dưới 30%, hệ thống tự động gỡ bỏ các máy chủ dư thừa để tiết kiệm chi phí.

---

## 🛠️ 2. Chuẩn Bị Công Cụ k6

Tải và cài đặt **k6** (Công cụ Load Test mã nguồn mở hiện đại):

- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo gpg -k
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```
- **macOS**: `brew install k6`
- **Windows**: `winget install k6`

---

## 📜 3. Kịch Bản Load Test (`load-test/test.js`)

Kịch bản được thiết kế mô phỏng người dùng thực hiện cả thao tác tìm kiếm (`GET`) và thêm sản phẩm (`POST`):

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Giai đoạn 1: Tăng lên 50 VUs trong 30s
    { duration: '1m',  target: 200 },  // Giai đoạn 2: Tăng mạnh lên 200 VUs trong 1 phút
    { duration: '3m',  target: 500 },  // Giai đoạn 3: Giữ tải đỉnh 500 VUs trong 3 phút (Đẩy CPU > 70%)
    { duration: '1m',  target: 50 },   // Giai đoạn 4: Hạ tải về 50 VUs
    { duration: '30s', target: 0 },    // Giai đoạn 5: Ngắt tải hoàn toàn
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% request phải phản hồi dưới 2 giây
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  // 1. Test API Search Product
  const searchRes = http.get(`${BASE_URL}/api/products/search?name=iphone`);
  check(searchRes, {
    'Search status 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Test API Add Product
  const payload = JSON.stringify({
    name: `Test Product ${Math.floor(Math.random() * 10000)}`,
    price: 199000,
    description: 'Load test generated item',
    stock: 10,
    category: 'LoadTest',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const addRes = http.post(`${BASE_URL}/api/products`, payload, params);
  check(addRes, {
    'Add Product status 201': (r) => r.status === 201,
  });

  sleep(1);
}
```

---

## 🚀 4. Các Bước Tiến Hành Thực Nghiệm

### Bước 1: Khởi Động Load Test
Mở terminal tại thư mục `load-test/` và truyền địa chỉ DNS của ALB:

```bash
cd load-test
k6 run -e TARGET_URL=http://<YOUR-ALB-DNS-NAME> test.js
```

### Bước 2: Quan Sát Trực Quan Trên AWS Console

1. **AWS EC2 Console -> Auto Scaling Groups**:
   - Mở ASG `cloudautoscale-asg`.
   - Quan sát tab **Activity**: Thấy thông báo `Executing scaling policy HighCPU-ScaleOut`.
   - Quan sát tab **Instance management**: Số lượng EC2 tăng dần từ 1 -> 2 -> 3 máy chủ.

2. **AWS CloudWatch Console -> Dashboards**:
   - Xem biểu đồ `CPUUtilization`: Thấy đường đồ thị vọt qua mốc 70%.
   - Biểu đồ `TargetResponseTime`: Đánh giá thời gian phản hồi khi ALB chia tải cho 3 máy chủ.

3. **Giao Diện Web App (Frontend)**:
   - Nhấn F5 liên tục trên giao diện React Web.
   - Quan sát **Node Indicator Badge** góc màn hình đổi tên Hostname linh hoạt giữa `ip-10-0-10-xx` và `ip-10-0-11-yy`.

### Bước 3: Quan Sát Quá Trình Scale-In
Khi k6 thông báo hoàn tất script execution (sau 6 phút):
- Tải giảm về 0, CPU hạ xuống < 10%.
- Sau 5 phút, CloudWatch Alarm `LowCPU-ScaleIn` kích hoạt.
- Auto Scaling Group tự động tiêu hủy (Terminate) 2 máy chủ thừa, đưa hệ thống về trạng thái 1 máy chủ duy nhất.

---

## 📝 5. Mẫu Bảng Ghi Nhận Kết Quả Viết Báo Cáo

| Giai Đoạn | Số VUs | CPU Utilization (%) | Số Máy Chủ EC2 | Trạng Thái Hệ Thống |
|---|---|---|---|---|
| Ban đầu (Idle) | 0 | 2.5% | 1 | Hoạt động bình thường |
| Tải nhẹ | 50 | 18.0% | 1 | Hoạt động bình thường |
| Tải trung bình | 200 | 52.0% | 1 | Chuẩn bị chạm ngưỡng |
| Tải đỉnh điểm | 500 | **84.5%** | **3 (Scale-out)** | Tự động mở rộng 2 máy chủ mới |
| Hạ tải | 0 | 3.1% | **1 (Scale-in)** | Tự động thu hẹp sau 5 phút |
