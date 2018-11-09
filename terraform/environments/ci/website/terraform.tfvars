terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  dependencies {
    paths = ["../../global/domain"]
  }
  terraform {
    source = "${get_tfvars_dir()}/../../../modules/website"
  }
}

aws_region = "us-east-1"
website_domain = "ci.drawbydays.com"
