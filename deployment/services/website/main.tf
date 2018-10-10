module "draw_by_days_website" {
  source = "../../modules/s3_website"

  bucket_name = "${var.namespace}-draw-by-days-website"
}
