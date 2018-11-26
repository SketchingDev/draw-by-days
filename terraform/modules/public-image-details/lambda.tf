data "aws_sns_topic" "image_on_platform" {
  name = "${var.namespace}-image-on-platform"
}

resource "aws_lambda_function" "save_image_details" {
  function_name = "${var.namespace}-save-image-details"
  handler = "main.handler"
  runtime = "nodejs8.10"
  filename = "${var.save_image_metadata_lambda_filename}"
  source_code_hash = "${base64sha256(file(var.save_image_metadata_lambda_filename))}"
  role = "${aws_iam_role.lambda_exec.arn}"
}

resource "aws_lambda_permission" "allow_process_invoker" {
  statement_id   = "AllowExecutionFromProcessInvoker"
  action         = "lambda:InvokeFunction"
  function_name  = "${aws_lambda_function.save_image_details.function_name}"
  principal      = "lambda.amazonaws.com"
}

resource "aws_lambda_permission" "allow_sns_execution" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.save_image_details.function_name}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${data.aws_sns_topic.image_on_platform.arn}"
}

resource "aws_sns_topic_subscription" "lambda" {
  topic_arn = "${data.aws_sns_topic.image_on_platform.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.save_image_details.arn}"
}

resource "aws_iam_role" "lambda_exec" {
  name  = "lambda_exec_role"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["sts:AssumeRole"],
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
