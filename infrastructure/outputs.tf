output "resource_group_name" {
  description = "The name of the created resource group."
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "The Azure resource ID of the resource group."
  value       = module.resource_group.id
}

output "resource_group_location" {
  description = "The Azure region the resource group was created in."
  value       = var.location
}