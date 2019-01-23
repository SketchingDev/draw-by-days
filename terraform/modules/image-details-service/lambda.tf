data "aws_sns_topic" "image_on_platform" {
  name = "${var.namespace}-image-on-platform"
}

module "save_image_url" {
  namespace = "${var.namespace}"
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//sns_subscribed_lambda?ref=tracing-option-lambda"
  sns_topic_arn = "${data.aws_sns_topic.image_on_platform.arn}"
  function_name = "${var.namespace}-save-image-url"
  function_filename = "${var.save_image_source_lambda_filename}"
  function_tracing_config = {
    mode = "Active"
  }
  sns_filter_policy= <<EOF
{
  "event" : ["ImageSource"]
}
EOF
  function_environment {
    variables {
      TABLE_NAME = "${aws_dynamodb_table.image_table.name}"
    }
  }
}

module "save_image_details" {
  namespace = "${var.namespace}"
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//sns_subscribed_lambda?ref=tracing-option-lambda"
  sns_topic_arn = "${data.aws_sns_topic.image_on_platform.arn}"
  function_name = "${var.namespace}-save-image-details"
  function_filename = "${var.save_image_details_lambda_filename}"
  function_tracing_config = {
    mode = "Active"
  }
  sns_filter_policy= <<EOF
{
  "event" : ["ImageDetails"]
}
EOF
  function_environment {
    variables {
      TABLE_NAME = "${aws_dynamodb_table.image_table.name}"
    }
  }
}

resource "aws_iam_policy" "dynamodb_write_access" {
  name = "${var.namespace}_dynamodb_write_access"
  path = "/"
  description = "IAM policy for writing to DynamoDB"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SpecificTable",
      "Effect": "Allow",
      "Action": [
        "dynamodb:BatchGet*",
        "dynamodb:DescribeStream",
        "dynamodb:DescribeTable",
        "dynamodb:Get*",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchWrite*",
        "dynamodb:CreateTable",
        "dynamodb:Delete*",
        "dynamodb:Update*",
        "dynamodb:PutItem"
      ],
      "Resource": "${aws_dynamodb_table.image_table.arn}"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "image_details_dynamodb_access" {
  role = "${module.save_image_details.lambda_function_role}"
  policy_arn = "${aws_iam_policy.dynamodb_write_access.arn}"
}

resource "aws_iam_role_policy_attachment" "image_url_dynamodb_access" {
  role = "${module.save_image_url.lambda_function_role}"
  policy_arn = "${aws_iam_policy.dynamodb_write_access.arn}"
}

resource "aws_iam_role_policy_attachment" "image_details_xray_access" {
  role = "${module.save_image_details.lambda_function_role}"
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "image_url_xray_access" {
  role = "${module.save_image_url.lambda_function_role}"
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}
