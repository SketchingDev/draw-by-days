provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

module "website" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//s3_website?ref=s3_website_takes_name"
  name = "drawbydays.com"
}

data "terraform_remote_state" "domain" {
  backend = "s3"
  config {
    region = "${var.aws_region}"
    bucket = "draw-by-days-terraform-state"
    key = "domain/terraform.tfstate"
  }
}

resource "aws_route53_record" "domain" {
   zone_id = "${data.terraform_remote_state.domain.zone_id}"
   name = "${data.terraform_remote_state.domain.name}"
   type = "A"
   alias {
     name = "${module.website.domain}"
     zone_id = "${module.website.hosted_zone_id}"
     evaluate_target_health = true
   }
}
