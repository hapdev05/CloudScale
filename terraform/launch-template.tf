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

  user_data = base64encode(<<-EOF
              #!/bin/bash
              sudo apt-get update -y
              sudo apt-get install -y nodejs npm git

              # Export DB Environment variables
              export DB_HOST="${aws_db_instance.mysql.address}"
              export DB_USER="${var.db_username}"
              export DB_PASSWORD="${var.db_password}"
              export DB_NAME="${var.db_name}"
              export PORT=5000

              # Clone/Setup application directory
              mkdir -p /home/ubuntu/app
              cd /home/ubuntu/app
              
              # Minimal embedded backend server starter for EC2 launch
              cat << 'NODEAPP' > server.js
              const express = require('express');
              const cors = require('cors');
              const mysql = require('mysql2/promise');
              const os = require('os');

              const app = express();
              app.use(cors());
              app.use(express.json());

              const pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10
              });

              app.get('/healthcheck', (req, res) => {
                res.status(200).json({
                  status: 'UP',
                  serverInfo: { hostname: os.hostname(), uptime: os.uptime() }
                });
              });

              app.get('/api/products', async (req, res) => {
                try {
                  const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
                  res.json({ success: true, data: rows, nodeInfo: { hostname: os.hostname() } });
                } catch (e) { res.status(500).json({ error: e.message }); }
              });

              app.get('/api/products/search', async (req, res) => {
                try {
                  const { name } = req.query;
                  const [rows] = await pool.query('SELECT * FROM products WHERE name LIKE ?', [`%\${name}%\`]);
                  res.json({ success: true, data: rows, nodeInfo: { hostname: os.hostname() } });
                } catch (e) { res.status(500).json({ error: e.message }); }
              });

              app.post('/api/products', async (req, res) => {
                try {
                  const { name, price, description, stock, category } = req.body;
                  const [r] = await pool.query('INSERT INTO products (name, price, description, stock, category) VALUES (?, ?, ?, ?, ?)', [name, price, description || '', stock || 0, category || 'General']);
                  res.status(201).json({ success: true, data: { id: r.insertId, name, price }, nodeInfo: { hostname: os.hostname() } });
                } catch (e) { res.status(500).json({ error: e.message }); }
              });

              app.listen(5000, () => console.log('EC2 Node.js Express running on port 5000'));
              NODEAPP

              npm init -y
              npm install express cors mysql2

              # Run with PM2 or node in background
              sudo npm install -g pm2
              pm2 start server.js --name "cloudautoscale-backend"
              pm2 save
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
