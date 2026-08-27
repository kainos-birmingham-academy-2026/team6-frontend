variable "location" {
  description = "The azure region where resources will be created"
  type        = string
  default     = "uksouth"
}

variable "environment" {
  description = "the deployment enviroment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "prod"], var.environment)
    error_message = "Environment must be one of: dev, test, or prod."
  }
}

variable "project_name" {
  description = "The short name of the project used for naming resources."
  type        = string
  default     = "team6"
}

