provider "aws" {
  region = "us-east-1"
}

locals {
  bucket_name = "draw-by-days-website"
}

module "website" {
  source = "../../../modules/services/website"
  bucket_name = "${local.bucket_name}"
}
