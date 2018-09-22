provider "aws" {
  region = "us-east-1"
}

module "artifact_bucket" {
  source = "../../../modules/services/artifact-bucket"

  name_suffix = "dev"
}
