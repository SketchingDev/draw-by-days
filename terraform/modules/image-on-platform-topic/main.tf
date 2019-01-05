provider "aws" {
  region = "${var.aws_region}"
}

terraform {
  # The configuration for this backend will be filled in by Terragrunt
  backend "s3" {}
}

data "aws_caller_identity" "current" {}

locals {
  account_id = "${data.aws_caller_identity.current.account_id}"
  topic_name = "${var.namespace}-image-on-platform"
}

resource "aws_sns_topic" "image_on_platform" {
  name = "${local.topic_name}"
  policy = <<POLICY
    {
	  "Version":"2012-10-17",
	  "Id":"MyAWSPolicy",
	  "Statement" :[
	    {
	      "Sid":"My-statement-id",
	      "Effect":"Allow",
	      "Principal" :"*",
	      "Action":"sns:Publish",
	      "Resource":"arn:aws:sns:*:*:${local.topic_name}",
	      "Condition":{
	        "StringEquals":{
	          "AWS:SourceAccount":"${local.account_id}"
	        }
	      }
	    }
	  ]
    }
POLICY
}
