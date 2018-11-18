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
    # Force Terraform to keep trying to acquire a lock for up to 5 minutes if someone else already has the lock
    extra_arguments "retry_lock" {
      commands  = ["${get_terraform_commands_that_need_locking()}"]
      arguments = ["-lock-timeout=5m"]
    }
    # extra_arguments "module_backends" {
    #   commands = [
    #     "init",
    #   ]
    #   arguments = ["-backend-config=${get_parent_tfvars_dir()}/remote_backend.tf"]
    # }
  }
}
