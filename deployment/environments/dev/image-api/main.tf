provider "aws" {
  region = "us-east-1"
}

module "image_api" {
    source = "../../../modules/services/image_api"

    lambda_file_path = "../../../../packages/image-api/dist/retrieve-image-lambda.zip"
}
