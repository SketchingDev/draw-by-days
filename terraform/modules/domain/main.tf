provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

locals {
  zone_domain_name = "drawbydays.com"
}

resource "aws_route53_zone" "primary" {
  name = "${local.zone_domain_name}"
}
