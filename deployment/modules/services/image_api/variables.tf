variable "lambda_path" {
    default = ""
    description = "Path to the lambda that will be deployed to the bucket with the name of the key"
}

variable "key" {
    description = "Key used for referening the lambda. Rollback can be achieved by providing the key of an existing lambda"
}