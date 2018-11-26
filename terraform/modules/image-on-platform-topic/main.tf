provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

locals {
  topic_name = "${var.namespace}-image-on-platform"
}

resource "aws_sns_topic" "image_on_platform" {
  name = "${local.topic_name}"
}
