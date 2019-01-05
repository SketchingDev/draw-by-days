output "subscribed_topic_arn" {
  value = "${data.aws_sns_topic.image_on_platform.arn}"
}

output "bucket_name" {
  value = "${aws_s3_bucket.public_images.id}"
}
