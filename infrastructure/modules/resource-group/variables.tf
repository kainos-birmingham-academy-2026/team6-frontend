variable "name" {
    description = "The name of resource group"
    type = string
}

variable "location" {
    description = "The azure region"
    type = string
}

variable "tags" {
    description = "tags to apply to resource group"
    type = map(string)
    default = {}
}