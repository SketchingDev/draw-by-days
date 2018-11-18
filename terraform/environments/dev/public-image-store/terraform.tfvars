terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  dependencies {
    paths = ["../../global/domain"]
  }
  terraform {
    source = "${get_tfvars_dir()}/../../../modules/public-image-store"
  }
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

aws_region = "us-east-1"
namespace = "draw-by-days-dev"
# image_api_domain = "images-dev.drawbydays.com"
