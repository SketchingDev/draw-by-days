provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

module "image_api" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//lambda_api_gateway"

  namespace = "${var.namespace}"

  lambda_filename = "${var.lambda_filename}"
  lambda_handler  = "main.handler"

  stage_name  = "images"
  domain_name = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
}
