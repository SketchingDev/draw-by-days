provider "aws" {
  region = "us-east-1"
}

module "website" {
  source = "../../../services/website"
  namespace = "dev"
}
