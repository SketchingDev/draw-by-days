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
    source = "${get_tfvars_dir()}/../../../modules/public-image-details"
  }
}

aws_region = "us-east-1"
namespace = "draw-by-days-ci"
image_api_domain = "images-ci.drawbydays.com"




