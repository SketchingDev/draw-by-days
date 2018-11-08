resource "aws_acm_certificate" "wildcard_cert" {
  domain_name       = "*.${var.zone_domain_name}"
  validation_method = "DNS"
}

# Add validation CNAME to top-level domain
resource "aws_route53_record" "cert_validation" {
  zone_id = "${aws_route53_zone.primary.zone_id}"

  name    = "${aws_acm_certificate.wildcard_cert.domain_validation_options.0.resource_record_name}"
  type    = "${aws_acm_certificate.wildcard_cert.domain_validation_options.0.resource_record_type}"
  records = [
    "${aws_acm_certificate.wildcard_cert.domain_validation_options.0.resource_record_value}",
  ]

  ttl = "60"
}

# Wait for certificate to be validated
resource "aws_acm_certificate_validation" "cert" {
  certificate_arn = "${aws_acm_certificate.wildcard_cert.arn}"

  validation_record_fqdns = [
    "${aws_route53_record.cert_validation.fqdn}",
  ]
}
