data "terraform_remote_state" "domain" {
  backend = "s3"

  config {
    region = "us-east-1"
    bucket = "draw-by-days-terraform-state"
    key    = "global/domain/terraform.tfstate"
  }
}

resource "aws_api_gateway_domain_name" "gateway_domain" {
  domain_name     = "${var.image_api_domain}"
  certificate_arn = "${data.terraform_remote_state.domain.certificate_arn}"
}

resource "aws_route53_record" "api_domain" {
  zone_id = "${data.terraform_remote_state.domain.zone_id}"

  name = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
  type = "A"

  alias {
    name                   = "${aws_api_gateway_domain_name.gateway_domain.cloudfront_domain_name}"
    zone_id                = "${aws_api_gateway_domain_name.gateway_domain.cloudfront_zone_id}"
    evaluate_target_health = true
  }
}

data "template_file" "dynamodb_table" {
  template = "${file("${path.module}/request-template.tpl.json")}"

  vars {
    table_name = "${aws_dynamodb_table.image_table.id}"
    id_column = "${local.id_column}"
  }
}

module "image_api" {
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//readonly_dynamodb_api_gateway?ref=allow_domain_name_for_dynamodb_api"

  namespace = "${var.namespace}"

  table_arn = "${aws_dynamodb_table.image_table.arn}"
  request_template = "${data.template_file.dynamodb_table.rendered}"

  root_path  = "images"
  path_part  = "{${local.id_column}}"
  domain_name = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
}
