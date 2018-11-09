# Deployment

## Directory structure

This uses the directory structure suggested by https://blog.gruntwork.io/how-to-manage-terraform-state-28f5697e68fa

## AWS IAM Policies

### Terragrunt remote state and locking

These are the IAM policies necessary for Terragrunt to create and use an S3 bucket and DynamoDB table
for remote state and locking. Originally from [Terragrunt's documentation](https://github.com/gruntwork-io/terragrunt#aws-iam-policies) they've been adapted for this project.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCreateAndListS3ActionsOnSpecifiedTerragruntBucket",
            "Effect": "Allow",
            "Action": [
                "s3:ListBucket",
                "s3:GetBucketVersioning",
                "s3:CreateBucket"
            ],
            "Resource": "arn:aws:s3:::draw-by-days-terraform-state"
        },
        {
            "Sid": "AllowGetAndPutS3ActionsOnSpecifiedTerragruntBucketPath",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::draw-by-days-terraform-state/*"
        },
        {
            "Sid": "AllowCreateAndUpdateDynamoDBActionsOnSpecifiedTerragruntTable",
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:DescribeTable",
                "dynamodb:DeleteItem",
                "dynamodb:CreateTable"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/draw-by-days-lock-table"
        }
    ]
}
```
