output "url" {
    value = "${module.website.website_endpoint}"
}

output "bucket_name" {
    value = "${local.bucket_name}"
}