## New deploy

Provide:
 * Lambda localpath
 * Key (comprises vx.x/filename)


# Lessons learned

## Separate deployment and provisioning

Terraform manages its resources, if you use the `aws_s3_bucket_object` resource to upload an S3 object then it
will replace that object if you modify the resource to upload something new.


19f5eebaa029b6ba18aa10b6d22596023e64dc7f

My original intention was to have the Terraform manage the provisioning and deployment of the Image API. It was
going to do this by taking two variables:

 * `lambda_filepath` - Path to the Lambda function's ZIP
 * `lambda_bucket_key` - Key used when uploading the said ZIP file to the S3 Bucket

The Terraform would then create a bucket and upload the ZIP to it under the key provided, it would then configure
the `aws_lambda_function` resource to point to that kay. The hope was that every Lambda function I uploaded via
the `aws_s3_bucket_object` would be retained to allow me to rollback to them if needed.

This didn't work though because Terraform manages its resources, so just kept replacing the lambda object. Meaning I 
coudn't rollback. I think the better option would be to:

1. Provision artefact bucket
2. Deploy to bucket
3. Call provisioner for Image-Api 



# https://stackoverflow.com/questions/47330253/can-i-have-terraform-keep-the-old-versions-of-objects
My original intention was to pass Terraform the path to the object to upload to a bucket, and its intended key, and 
then set the lambda 


## Rollback

 * Key (comprises vx.x/filename) of previously deployed lambda
