resource "aws_s3_bucket" "artifact_repository" {
  bucket = "${var.name_suffix}-artifacts-bucket"
  acl    = "private"
}
