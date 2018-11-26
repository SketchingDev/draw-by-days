provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

locals {
  id_column = "DateId"
}

resource "aws_dynamodb_table" "image_table" {
  name           = "${var.namespace}-images"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "${local.id_column}"

  attribute {
    name = "${local.id_column}"
    type = "S"
  }
}

