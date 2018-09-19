output "url" {
    value = "${module.image_api.url}"
}

output "bucket_name" {
    value = "${aws_s3_bucket.api_lambda_bucket.id}"
    description = "Name of the bucket that contains the endpoint's lambda"
}

output "bucket_artifact_key" {
    value = "${aws_s3_bucket_object.api_lambda_object.id}"
    description = "Key for the endpoint's lambda in the bucket"
}