# Draw by Days 
[![Build Status](https://travis-ci.org/SketchingDev/Draw-by-Days.svg?branch=react_rewrite)](https://travis-ci.org/SketchingDev/Draw-by-Days) 
[![Coverage Status](https://coveralls.io/repos/github/SketchingDev/Draw-by-Days/badge.svg?branch=master)](https://coveralls.io/github/SketchingDev/Draw-by-Days?branch=master)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Draw-by-days provides artists (amateur or professional) with an image a day to practice their particular 
artistry. The more days you do the better you'll get.

Aside from hopefully being a useful platform for artists, it provides me with practical experience iteratively 
developing an AWS based serverless project!

## Development

* Monorepo managed by Lerna
* Yarn
* Node/TypeScript
* Terraform

## Services

Each directory under `packages/` is an isolated service with its own code-base, component tests, build management and deployment 
scripts.

 * `website/` - [README](packages/website/README.md) - Front-end website that will display a single image
 * `image-api/` - [README](packages/image-api/README.md) - API that serves images
