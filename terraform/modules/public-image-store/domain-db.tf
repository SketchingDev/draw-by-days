resource "aws_dynamodb_table" "image_table" {
  name           = "${local.table_name}"
  read_capacity  = 1
  write_capacity = 1
  hash_key       = "${local.id_column}"

  attribute {
    name = "${local.id_column}"
    type = "S"
  }
}
