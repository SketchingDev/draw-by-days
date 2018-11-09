# Domain

## Region

The ACM Certificate must be created in the US East (N. Virginia), also known as `us-east-1`, as
it is used in other modules with Amazon CloudFront, as per the [documentation](https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html).

## Manual steps

After creating the hosted zone and you will need to update the domain name with the DNS entries.
See https://github.com/hashicorp/terraform/issues/5368
