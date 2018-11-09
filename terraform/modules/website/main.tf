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
    region = "us-east-1"
    bucket = "draw-by-days-terraform-state"
    key = "global/domain/terraform.tfstate"
  }
}

module "website" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//s3_website"
  name = "${var.website_domain}"
}

resource "aws_route53_record" "domain" {
   zone_id = "${data.terraform_remote_state.domain.zone_id}"
   name = "${var.website_domain}"
   type = "A"
   alias {
     name = "${module.website.domain}"
     zone_id = "${module.website.hosted_zone_id}"
     evaluate_target_health = true
   }
}
