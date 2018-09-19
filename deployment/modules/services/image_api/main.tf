locals {
  lambda_api_gateway_name = "ImageAPI"
  lambda_bucket_name = "image-api-bucket"
  lambda_bucket_key = "retrieve-image-lambda.zip"
}

resource "aws_s3_bucket" "api_lambda_bucket" {
  bucket = "${local.lambda_bucket_name}"
  acl    = "private"
  force_destroy = true
}

resource "aws_s3_bucket_object" "api_lambda_object" {
  count = "${var.lambda_path != "" ? 1 : 0}"

  bucket = "${aws_s3_bucket.api_lambda_bucket.id}"
  key    = "${var.key}"
  source = "${var.lambda_path}"
  etag   = "${md5(file("${var.lambda_path}"))}"
}

module "image_api" {
  source = "../../lambda_api_gateway"

  name = "${local.lambda_api_gateway_name}"
  lambda_bucket_name = "${aws_s3_bucket.api_lambda_bucket.id}"
  lambda_bucket_key = "${var.key}"
}
