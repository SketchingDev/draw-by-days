data "terraform_remote_state" "domain" {
  backend = "s3"

  config {
    region = "${var.aws_region}"
    bucket = "draw-by-days-terraform-state"
    key    = "domain/terraform.tfstate"
  }
}

resource "aws_acm_certificate" "cert" {
  domain_name       = "${var.image_api_domain}"
  validation_method = "DNS"
}

# Add validation CNAME to top-level domain
resource "aws_route53_record" "cert_validation" {
  zone_id = "${data.terraform_remote_state.domain.zone_id}"

  name    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_type}"
  records = [
    "${aws_acm_certificate.cert.domain_validation_options.0.resource_record_value}",
  ]

  ttl = "60"
}

# Wait for certificate to be validated
resource "aws_acm_certificate_validation" "cert" {
  certificate_arn = "${aws_acm_certificate.cert.arn}"

  validation_record_fqdns = [
    "${aws_route53_record.cert_validation.fqdn}",
  ]
}

resource "aws_api_gateway_domain_name" "gateway_domain" {
  domain_name     = "${var.image_api_domain}"
  certificate_arn = "${aws_acm_certificate_validation.cert.certificate_arn}"
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
