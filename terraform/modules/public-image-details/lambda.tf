data "aws_sns_topic" "image_on_platform" {
  name = "${var.namespace}-image-on-platform"
}

module "sns_lambda" {
  namespace = "${var.namespace}"
  source = "git::https://github.com/SketchingDev/draw-by-days-terraform-modules.git//sns_subscribed_lambda"
  sns_topic_arn = "${data.aws_sns_topic.image_on_platform.arn}"
  function_name = "${var.namespace}-save-image-details"
  function_filename = "${var.save_image_metadata_lambda_filename}"
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

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role = "${module.sns_lambda.lambda_function_role}"
  policy_arn = "${aws_iam_policy.dynamodb_write_access.arn}"
}
