provider "aws" {
  region = "us-east-1"
}

module "image_api" {
  source = "../../../services/image_api"

  namespace = "dev"
  filename = "${var.filename}"
}
