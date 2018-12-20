output "private_url" {
  value = "${module.image_api.url}"
}

output "public_url" {
  value = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
}

output "images_table_name" {
  value = "${aws_dynamodb_table.image_table.id}"
}

output "subscribed_topic_arn" {
  value = "${data.aws_sns_topic.image_on_platform.arn}"
}
