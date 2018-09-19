output "image_api_url" {
  value = "${module.image_api.url}"
}
 
output "bucket_name" {
    value = "${module.image_api.bucket_name}"
    description = "Name of the bucket that contains the endpoint's lambda"
}

output "bucket_artifact_key" {
    value = "${module.image_api.bucket_artifact_key}"
    description = "Key for the endpoint's lambda in the bucket"
}