variable "aws_region" {
  description = "AWS Region triển khai hạ tầng"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Tên viết tắt dự án"
  type        = string
  default     = "cloudautoscale"
}

variable "vpc_cidr" {
  description = "Dải IP CIDR block cho VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "instance_type" {
  description = "Loại máy chủ EC2"
  type        = string
  default     = "t3.micro"
}

variable "db_name" {
  description = "Tên Database MySQL trên RDS"
  type        = string
  default     = "cloudautoscale_db"
}

variable "db_username" {
  description = "Tên tài khoản admin Database RDS"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Mật khẩu tài khoản admin Database RDS"
  type        = string
  default     = "CloudAutoScaling2026Secured!"
  sensitive   = true
}
