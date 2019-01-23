# Draw by Days

[![Build Status](https://circleci.com/gh/SketchingDev/draw-by-days/tree/master.svg?style=svg)](https://circleci.com/gh/SketchingDev/draw-by-days/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/SketchingDev/draw-by-days/badge.svg?branch=master)](https://coveralls.io/github/SketchingDev/draw-by-days?branch=master)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Draw by Days is project that I've been using to explore the emerging serverless offerings of AWS. Take a look around,
you'll find:

  * Event-driven architecture with SNS as the backbone
  * Serverless microservices (deploy independently)
  * Imperfect solutions as I try to learn the plethora of whizzy technologies out there

Besides a learning exercise I'm hoping Draw by Days will provide artists (amateur or professional) with an image a day
to reproduce in their particular medium. The more days you complete the better you'll get - or at least I'm hoping!

## Technologies

 * AWS Lambda, DynamoDB, SNS, API Gateway, S3 etc
 * Terraform / Terragrunt / Terratest
 * NodeJS / TypeScript / Lerna / Yarn
 * CircleCI

## Architecture


## Project structure

Following the general patterns for node projects to live under a `packages` directory and
[Terraform best practises][terraform-best-practises] to define infrastructure under a `modules` directory and
environment specific variables in their own directories has left me with the following structure:

```
terraform/
   modules/
       image-details-service/          # Terraform for the Image Details service
   environments/                       # Production specific variables for said service
       prod/
           image-details-service/
               terraform.tfvars
packages/
    image-details-service/
        src/                           # Code for Lambdas of said service
        test/                          # Integration test run against deployed service
```

## Deployment

All infrastructure is defined as code using [Terraform][terraform]. Read in more detail at 
[terraform/README.md](./terraform/README.md), otherwise here are some key points...

* IaC using Terraform
* [Terragrunt][terragrunt] used as wrapper to help follow best practises and keep infrastructure DRY
* Services are encapsulated in Terraform modules
  * Modules that are reusable between services (e.g. [SNS triggered Lambdas][sns-subscribed-lambda]) are defined in 
  [their own repo][terraform-modules] with [Terratest][terratest] tests
* [Component tests](https://microservices.io/patterns/testing/service-component-test.html) for each service are 
  contained in their respective `packages/` directory



[terraform]: https://www.terraform.io/
[terraform-best-practises]: https://www.terraform.io/docs/enterprise/workspaces/repo-structure.html
[terragrunt]: https://github.com/gruntwork-io/terragrunt
[terratest]: https://github.com/gruntwork-io/terratest

[terraform-modules]: https://github.com/SketchingDev/draw-by-days-terraform-modules
[sns-subscribed-lambda]: https://github.com/SketchingDev/draw-by-days-terraform-modules/tree/master/sns_subscribed_lambda
