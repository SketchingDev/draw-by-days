terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  dependencies {
    paths = [
      "../../global/domain",
      "../image-on-platform-topic"
    ]
  }
  terraform {
    source = "${get_tfvars_dir()}/../../../modules/image-details-service"
  }
}

aws_region = "us-east-1"
namespace = "draw-by-days-prod"
image_api_domain = "images.drawbydays.com"
