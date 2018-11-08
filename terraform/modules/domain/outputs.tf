output "name" {
    value = "${var.zone_domain_name}"
}

output "zone_id" {
    sensitive = true,
    value = "${aws_route53_zone.primary.zone_id}"
}

output "certificate_arn" {
    sensitive = true,
    value = "${aws_acm_certificate_validation.cert.certificate_arn}"
}
