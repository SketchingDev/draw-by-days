terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  dependencies {
    paths = ["../domain"]
  }
  terraform {
    source = "${get_tfvars_dir()}/../../modules/image-api"
  }
}
