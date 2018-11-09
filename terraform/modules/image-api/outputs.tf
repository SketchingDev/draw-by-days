output "private_url" {
  sensitive = true,
  value = "${module.image_api.url}"
}

output "public_url" {
  value = "${aws_api_gateway_domain_name.gateway_domain.domain_name}"
}
