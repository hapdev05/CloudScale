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

              apt-get update -y
              apt-get install -y nodejs npm git

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
              const http = require('http');
              const os = require('os');
              const fs = require('fs');
              const path = require('path');
              let mysql;
              try { mysql = require('mysql2/promise'); } catch (e) {}

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

              const dbHost = process.env.DB_HOST || 'localhost';
              const dbUser = process.env.DB_USER || 'admin';
              const dbPassword = process.env.DB_PASSWORD || '';
              const dbName = process.env.DB_NAME || 'cloudautoscale_db';
              const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

              let pool = null;
              async function getPool() {
                if (!pool) {
                  try {
                    if (!mysql) mysql = require('mysql2/promise');
                    pool = mysql.createPool({
                      host: dbHost,
                      user: dbUser,
                      password: dbPassword,
                      database: dbName,
                      port: dbPort,
                      waitForConnections: true,
                      connectionLimit: 10,
                    });
                    const tempConn = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword, port: dbPort });
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
                  } catch (e) { console.error('DB Init Error:', e.message); }
                }
                return pool;
              }

              const server = http.createServer(async (req, res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                if (req.method === 'OPTIONS') {
                  res.writeHead(200);
                  res.end();
                  return;
                }

                if (req.url === '/healthcheck' || req.url === '/') {
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ status: 'UP', timestamp: new Date().toISOString(), serverInfo: { hostname: os.hostname(), uptime: os.uptime() } }));
                  return;
                }

                if (req.url === '/api/products' && req.method === 'GET') {
                  try {
                    const p = await getPool();
                    const [rows] = p ? await p.query('SELECT * FROM products ORDER BY id DESC') : [[]];
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, count: rows.length, data: rows, nodeInfo: { hostname: os.hostname() } }));
                  } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: e.message, nodeInfo: { hostname: os.hostname() } }));
                  }
                  return;
                }

                if (req.url.startsWith('/api/products/search') && req.method === 'GET') {
                  try {
                    const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
                    const name = urlParams.get('name') || '';
                    const p = await getPool();
                    const [rows] = p ? await p.query('SELECT * FROM products WHERE name LIKE ? ORDER BY id DESC', ['%' + name + '%']) : [[]];
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, total: rows.length, query: name, data: rows, nodeInfo: { hostname: os.hostname() } }));
                  } catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: e.message, nodeInfo: { hostname: os.hostname() } }));
                  }
                  return;
                }

                if (req.url === '/api/products' && req.method === 'POST') {
                  let body = '';
                  req.on('data', chunk => { body += chunk.toString(); });
                  req.on('end', async () => {
                    try {
                      const data = JSON.parse(body || '{}');
                      const p = await getPool();
                      let result = { insertId: Date.now() };
                      if (p) {
                        const [r] = await p.query('INSERT INTO products (name, price, description, stock, category) VALUES (?, ?, ?, ?, ?)', [data.name, data.price, data.description || '', data.stock || 0, data.category || 'General']);
                        result = r;
                      }
                      res.writeHead(201, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: true, message: 'Product created successfully', data: { id: result.insertId, ...data }, nodeInfo: { hostname: os.hostname() } }));
                    } catch (e) {
                      res.writeHead(500, { 'Content-Type': 'application/json' });
                      res.end(JSON.stringify({ success: false, error: e.message, nodeInfo: { hostname: os.hostname() } }));
                    }
                  });
                  return;
                }

                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
              });

              const PORT = process.env.PORT || 5000;
              server.listen(PORT, () => {
                console.log('HTTP Server listening on port ' + PORT);
              });
              NODEAPP

              npm init -y
              npm install mysql2

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
