variable "name_suffix" {
  description = "Name used as a suffix for resources"
}

variable "source_bucket" {
  description = "Name of the bucket that contains the Lambda that serves the gateway's endpoint"
}

variable "lambda_key" {
  description = "The key used to identify the lambda in the bucket"
}
