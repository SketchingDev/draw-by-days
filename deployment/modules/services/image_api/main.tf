module "image_api" {
  source = "../../lambda_api_gateway"

  name = "${var.name_suffix}_image_api"
  lambda_bucket_name = "${var.source_bucket}"
  lambda_bucket_key = "${var.lambda_key}"
}
