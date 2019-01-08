provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

data "aws_sns_topic" "image_on_platform" {
  name = "${var.namespace}-image-on-platform"
}

locals {
  bucket_name = "${var.namespace}-public-images"
}

resource "aws_s3_bucket" "public_images" {
  bucket = "${local.bucket_name}"
  acl = "public-read"
  policy = <<EOF
{
  "Id": "bucket_policy_site",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "bucket_policy_site_main",
      "Action": [
        "s3:GetObject"
      ],
      "Effect": "Allow",
      "Resource": "arn:aws:s3:::${local.bucket_name}/*",
      "Principal": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.namespace}-iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_permission" "allow_bucket" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.public_image_event_publisher.arn}"
  principal     = "s3.amazonaws.com"
  source_arn    = "${aws_s3_bucket.public_images.arn}"
}

resource "aws_lambda_function" "public_image_event_publisher" {
  filename      = "${var.new_image_event_producer_lambda_filename}"
  function_name = "${var.namespace}-publish-new-image-event"
  role          = "${aws_iam_role.iam_for_lambda.arn}"
  handler       = "main.handler"
  runtime       = "nodejs8.10"
  source_code_hash = "${base64sha256(file(var.new_image_event_producer_lambda_filename))}"
  environment   = {
    variables {
      SNS_TOPIC_ARN = "${data.aws_sns_topic.image_on_platform.arn}"
      BUCKET_PUBLIC_URL = "https://${aws_s3_bucket.public_images.bucket_domain_name}"
    }
  }
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = "${aws_s3_bucket.public_images.id}"

  lambda_function {
    lambda_function_arn = "${aws_lambda_function.public_image_event_publisher.arn}"
    events              = ["s3:ObjectCreated:*"]
  }
}

resource "aws_cloudwatch_log_group" "sns_lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.public_image_event_publisher.function_name}"
  retention_in_days = 14
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_publish" {
  role = "${aws_iam_role.iam_for_lambda.name}"
  policy_arn = "arn:aws:iam::aws:policy/AmazonSNSFullAccess"
}
