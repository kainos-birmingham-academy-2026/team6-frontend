terraform {
  required_version = ">= 1.15.8"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-team6-tfstate"
    storage_account_name = "sttfstateteam6"
    container_name       = "tfstate"
    # key is passed at `terraform init` time via -backend-config so it can vary per environment
  }
}

provider "azurerm" {
  features {}
}

module "resource_group" {
  source   = "./modules/resource-group"
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    environment = var.environment
  }
}