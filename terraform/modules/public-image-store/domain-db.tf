locals {
  id_column = "DateId"
}

resource "aws_dynamodb_table" "image_table" {
  name           = "${var.namespace}-images"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "${local.id_column}"

  attribute {
    name = "${local.id_column}"
    type = "S"
  }
}
