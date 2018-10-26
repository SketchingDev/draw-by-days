terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  terraform {
    source = "${get_tfvars_dir()}/../../modules/image-api"
  }
}
