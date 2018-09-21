variable "name" {}

variable "lambda_bucket_name" {}
variable "lambda_bucket_key" {}

# Hack as modules do not yet support depends on 
# https://medium.com/@bonya/terraform-adding-depends-on-to-your-custom-modules-453754a8043e
# Issue: https://github.com/hashicorp/terraform/issues/10462
variable depends_on_hack { default = [], type = "list"}