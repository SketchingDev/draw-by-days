provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

module "website" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//s3_website"
  namespace = "${var.namespace}"
}
