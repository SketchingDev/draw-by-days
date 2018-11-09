provider "aws" {
  # us-east-1 only region for certificates to be used as API Gateway domain
  region = "us-east-1"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

resource "aws_route53_zone" "primary" {
  name = "${var.zone_domain_name}"
}
