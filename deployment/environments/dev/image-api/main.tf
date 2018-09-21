provider "aws" {
  region = "us-east-1"
}

module "image_api" {
  source = "../../../modules/services/image_api"

  lambda_path = "${var.lambda_filepath}"
  key = "${var.lambda_key}"
}
