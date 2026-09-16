output "alb_dns_name" {
  description = "Tên DNS Công cộng của Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID của Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "rds_endpoint" {
  description = "Endpoint kết nối cơ sở dữ liệu AWS RDS MySQL"
  value       = aws_db_instance.mysql.endpoint
}

output "rds_database_name" {
  description = "Tên Database mặc định trên AWS RDS"
  value       = aws_db_instance.mysql.db_name
}

output "asg_name" {
  description = "Tên của Auto Scaling Group"
  value       = aws_autoscaling_group.main.name
}
