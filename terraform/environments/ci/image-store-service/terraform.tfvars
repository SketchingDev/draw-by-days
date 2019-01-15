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
    source = "${get_tfvars_dir()}/../../../modules/image-store-service"
  }
}

aws_region = "us-east-1"
namespace = "draw-by-days-ci"
