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
              exec > /var/log/user-data.log 2>&1
              set -x

              # Fast download pre-compiled Node.js 18 binary tarball (.tar.gz - zero dependencies)
              curl -fsSL https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x86_64.tar.gz | tar -xz --strip-components=1 -C /usr/local

              mkdir -p /home/ubuntu/app
              cd /home/ubuntu/app

              cat << ENVFILE > .env
              PORT=5000
              DB_HOST=${aws_db_instance.mysql.address}
              DB_USER=${var.db_username}
              DB_PASSWORD=${var.db_password}
              DB_NAME=${var.db_name}
              DB_PORT=3306
              ENVFILE

              cat << 'NODEAPP' > server.js
              const express = require('express');
              const cors = require('cors');
              const mysql = require('mysql2/promise');
              const os = require('os');
              const fs = require('fs');
              const path = require('path');

              const envPath = path.join(__dirname, '.env');
              if (fs.existsSync(envPath)) {
                const envConfig = fs.readFileSync(envPath, 'utf8');
                envConfig.split('\n').forEach(line => {
                  const parts = line.split('=');
                  const key = parts[0] ? parts[0].trim() : '';
                  const value = parts.slice(1).join('=').trim();
                  if (key && value) {
                    process.env[key] = value;
                  }
                });
              }

              const app = express();
              app.use(cors());
              app.use(express.json());

              const dbHost = process.env.DB_HOST || 'localhost';
              const dbUser = process.env.DB_USER || 'admin';
              const dbPassword = process.env.DB_PASSWORD || '';
              const dbName = process.env.DB_NAME || 'cloudautoscale_db';
              const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

              const pool = mysql.createPool({
                host: dbHost,
                user: dbUser,
                password: dbPassword,
                database: dbName,
                port: dbPort,
                waitForConnections: true,
                connectionLimit: 10,
              });

              async function initDB() {
                try {
                  const tempConn = await mysql.createConnection({
                    host: dbHost,
                    user: dbUser,
                    password: dbPassword,
                    port: dbPort,
                  });
                  await tempConn.query('CREATE DATABASE IF NOT EXISTS `' + dbName + '`;');
                  await tempConn.end();

                  const conn = await pool.getConnection();
                  await conn.query(`
                    CREATE TABLE IF NOT EXISTS products (
                      id INT AUTO_INCREMENT PRIMARY KEY,
                      name VARCHAR(255) NOT NULL,
                      price DECIMAL(10, 2) NOT NULL,
                      description TEXT,
                      stock INT DEFAULT 0,
                      category VARCHAR(100),
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                  `);
                  conn.release();
                  console.log('Database initialized successfully.');
                } catch (err) {
                  console.error('DB Init Error:', err.message);
                }
              }

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
                  const [rows] = await pool.query('SELECT * FROM products WHERE name LIKE ?', ['%' + (name || '') + '%']);
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

              const PORT = process.env.PORT || 5000;
              app.listen(PORT, async () => {
                console.log('Server listening on port ' + PORT);
                await initDB();
              });
              NODEAPP

              npm init -y
              npm install express cors mysql2

              nohup node server.js > app.log 2>&1 &
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
