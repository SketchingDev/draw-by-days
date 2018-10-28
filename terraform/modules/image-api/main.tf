provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

data "terraform_remote_state" "domain" {
  backend = "s3"
  config {
    region = "${var.aws_region}"
    bucket = "draw-by-days-terraform-state"
    key = "domain/terraform.tfstate"
  }
}

resource "aws_route53_zone" "image-api" {
  name = "image.drawbydays.com"
}

module "image_api" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//lambda_api_gateway?ref=api_gateway_domain"

  namespace = "${var.namespace}"

  stage_name = "images"

  lambda_filename = "${var.lambda_filename}"
  lambda_handler = "main.handler"
  domain_name = "image.drawbydays.com"
  domain_zone_id = "${data.terraform_remote_state.domain.zone_id}"
}



# zone_id = "${data.terraform_remote_state.domain.zone_id}"
#    name = "${data.terraform_remote_state.domain.name}"

# resource "aws_route53_record" "image-api-namespace" {
#   zone_id = "${data.terraform_remote_state.domain.zone_id}"
#   name    = "image.drawbydays.com"
#   type    = "NS"
#   ttl     = "30"

#   records = [
#     "${aws_route53_zone.image-api.name_servers.0}",
#     "${aws_route53_zone.image-api.name_servers.1}",
#     "${aws_route53_zone.image-api.name_servers.2}",
#     "${aws_route53_zone.image-api.name_servers.3}",
#   ]
# }
