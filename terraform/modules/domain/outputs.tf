output "name" {
    value = "${local.zone_domain_name}"
}

output "zone_id" {
    sensitive = true,
    value = "${aws_route53_zone.primary.zone_id}"
}
