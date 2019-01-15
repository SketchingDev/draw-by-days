output "aws_region" {
  value = "${var.aws_region}"
}

output "private_url" {
  value = "${module.image_api.url}"
}

output "public_url" {
  value = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
}

output "subscribed_topic_arn" {
  value = "${data.aws_sns_topic.image_on_platform.arn}"
}
