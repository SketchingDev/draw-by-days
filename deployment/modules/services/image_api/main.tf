module "image_api" {
  source = "../../lambda_api_gateway"

  name = "ImageAPI"
  lambda_file_path = "${var.lambda_file_path}"
}
