# AMI Linux 2023 / Ubuntu 22.04 LTS
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Launch Template định nghĩa cấu hình EC2 Instance
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-lt-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.ec2_sg.id]
  }

  # IMPORTANT: Do NOT indent the heredoc content or closing delimiter
  # <<-EOF only strips leading TABS, not spaces. Inner heredocs (ENVEOF, JSEOF)
  # must have their closing delimiter at column 0 or bash won't recognize them.
  user_data = base64encode(<<EOF
#!/bin/bash
exec > /var/log/user-data.log 2>&1
set -x

apt-get update -y
apt-get install -y nodejs npm git

# Clone repository mã nguồn từ GitHub
mkdir -p /home/ubuntu/app
git clone https://github.com/hapdev05/CloudScale.git /home/ubuntu/app
cd /home/ubuntu/app/backend

# Tự động ghi file .env kết nối với AWS RDS MySQL
cat << ENVFILE > .env
PORT=5000
DB_HOST=${aws_db_instance.mysql.address}
DB_USER=${var.db_username}
DB_PASSWORD=${var.db_password}
DB_NAME=${var.db_name}
DB_PORT=3306
ENVFILE

# Cài đặt thư viện Node.js và khởi chạy Backend Server
npm install
nohup npm start > app.log 2>&1 &
EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-backend-node"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}
