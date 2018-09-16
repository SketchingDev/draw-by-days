provider "aws" {
  region = "us-east-1"
}

module "website" {
  source = "../../../modules/s3_website"
  bucket_name = "draw-by-days"
}
