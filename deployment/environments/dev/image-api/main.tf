provider "aws" {
  region = "us-east-1"
}

module "image_api" {
    source = "../../../modules/services/image_api"

    function_file = "../../../../image-api/dist/image-api.zip"
}
