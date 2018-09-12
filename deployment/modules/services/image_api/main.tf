module "image_api" {
  source = "../../lambda_api_gateway"

  name = "ImageAPI"
  function_file_path = "${var.function_file}"
}
