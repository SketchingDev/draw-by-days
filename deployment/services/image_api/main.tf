module "image_api" {
  source = "../../modules/lambda_api_gateway"

  namespace = "${var.namespace}_image_api"
  lambda_filename = "${var.filename}"
  lambda_handler = "main.handler"
  stage_name = "images"
}
