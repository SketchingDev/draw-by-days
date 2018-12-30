terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  dependencies {
    paths = [
      "../image-on-platform-topic"
    ]
  }
  terraform {
    source = "${get_tfvars_dir()}/../../../modules/public-image-store"
  }
}

aws_region = "us-east-1"
namespace = "draw-by-days-ci"
