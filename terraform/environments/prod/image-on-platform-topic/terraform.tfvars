terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  terraform {
    source = "${get_tfvars_dir()}/../../../modules/image-on-platform-topic"
  }
}

aws_region = "us-east-1"
namespace = "draw-by-days"
