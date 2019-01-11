output "aws_region" {
    value = "${var.aws_region}"
}

output "bucket_name" {
    value = "${module.website.bucket_name}"
}

output "url" {
    value = "${aws_route53_record.domain.name}"
}
