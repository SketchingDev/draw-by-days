terragrunt = {
  include {
    path = "${find_in_parent_folders()}"
  }
  terraform {
    source = "${get_tfvars_dir()}/../../modules/lambda_api_gateway"
  }
}

stage_name = "images"
lambda_handler = "main.handler"
