provider "aws" {
  region = "us-east-1"
}

module "image_api" {
  source = "../../../modules/services/image_api"

  name_suffix = "dev"
  source_bucket = "${var.source_bucket}"
  lambda_key = "${var.lambda_key}"
}
