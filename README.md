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

 * AWS Lambda / DynamoDB / SNS / API Gateway / S3
 * Terraform / Terragrunt / Terratest
 * NodeJS / TypeScript / Lerna / Yarn
 * CircleCI

## Architecture


## Where to start

It's worth starting by explaining that a service's code and infrastructure are stored separately: 

 * `packages/` - Code and [component tests](https://microservices.io/patterns/testing/service-component-test.html) for services
 * `terraform/`
   * `modules/` - Infrastructure for services *(Common infrastructure stored in a [separate repo with tests][terraform-modules])*
   * `environment/`
     * `<environment>/` - Variables for each service per environment

*This split is due to the convention of node projects living under a `packages` directory and
[Terraform best practises][terraform-best-practises] advising that infrastructure lives under `modules` and
`environments` directories.*


[terraform]: https://www.terraform.io/
[terraform-best-practises]: https://www.terraform.io/docs/enterprise/workspaces/repo-structure.html
[terragrunt]: https://github.com/gruntwork-io/terragrunt
[terratest]: https://github.com/gruntwork-io/terratest

[terraform-modules]: https://github.com/SketchingDev/draw-by-days-terraform-modules
[sns-subscribed-lambda]: https://github.com/SketchingDev/draw-by-days-terraform-modules/tree/master/sns_subscribed_lambda
