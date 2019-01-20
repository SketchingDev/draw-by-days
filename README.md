# Draw by Days

[![Build Status](https://circleci.com/gh/SketchingDev/draw-by-days/tree/master.svg?style=svg)](https://circleci.com/gh/SketchingDev/draw-by-days/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/SketchingDev/draw-by-days/badge.svg?branch=master)](https://coveralls.io/github/SketchingDev/draw-by-days?branch=master)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Draw by Days is project that I've been using to explore the emerging serverless offerings of AWS. The principles
that I've been following are:

* Micro-service architecture
* AWS's serverless offerings
* Event-driven

Besides a learning exercise I'm hoping Draw by Days will provide artists (amateur or professional) with an image a day
to reproduce in their particular medium. The more days you complete the better you'll get - or at least I'm hoping!

## Architecture

My goal has been to write a platform that only uses AWS's serverless technologies using a micro-service architecture. 
Naturally this means that it is over engineered for 

_The purpose of this project has been to learn technologies that I can apply at work, so if parts seem over-engineered for this use-case
then I've likely used it to explore a concept that I've then applied elsewhere._

* Service-oriented architecture
* Monorepo managed by Lerna
* Yarn
* Node/TypeScript

## Deployment

All infrastructure is defined as code using [Terraform][terraform]. Read in more detail at 
[terraform/README.md](./terraform/README.md), otherwise here are some key points...

### Key Points

* IaC using Terraform
* [Terragrunt][terragrunt] used as wrapper to help follow best practises and keep infrastructure DRY
* Services are encapsulated in Terraform modules
  * Modules that are reusable between services (e.g. [SNS triggered Lambdas][sns-subscribed-lambda]) are defined in 
  [their own repo][terraform-modules] with [Terratest][terratest] tests
* [Component tests](https://microservices.io/patterns/testing/service-component-test.html) for each service are 
  contained in their respective `packages/` directory

## Services

Each service has a directory under:
  * `packages/` - code
  * `deployment/services` - infrastructure

* `website/` - [README](packages/website/README.md) - Front-end website that will display a single image
* `image-api/` - [README](packages/image-api/README.md) - API that serves images


[terraform]: https://www.terraform.io/
[terragrunt]: https://github.com/gruntwork-io/terragrunt
[terratest]: https://github.com/gruntwork-io/terratest

[terraform-modules]: https://github.com/SketchingDev/draw-by-days-terraform-modules
[sns-subscribed-lambda]: https://github.com/SketchingDev/draw-by-days-terraform-modules/tree/master/sns_subscribed_lambda
