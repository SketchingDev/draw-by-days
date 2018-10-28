terragrunt = {
  remote_state {
    backend = "s3"
    config {
      bucket         = "draw-by-days-terraform-state"
      key            = "${path_relative_to_include()}/terraform.tfstate"
      region         = "us-east-1"
      encrypt        = true
      dynamodb_table = "draw-by-days-lock-table"

      s3_bucket_tags {
        owner = "Draw-By-Days"
        name  = "Terraform state storage"
      }

      dynamodb_table_tags {
        owner = "Draw-By-Days"
        name  = "Terraform lock table"
      }
    }
  }
  terraform {
    extra_arguments "common_var" {
      commands  = ["${get_terraform_commands_that_need_vars()}"]
      arguments = [
        "-var-file=${get_parent_tfvars_dir()}/common.tfvars",
        "-var-file=${get_parent_tfvars_dir()}/env-${get_env("TF_VAR_env", "dev")}.tfvars"]
    }
  }
}
