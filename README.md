# Draw by Days

[![Build Status](https://img.shields.io/circleci/project/github/SketchingDev/draw-by-days/master.svg)](https://circleci.com/gh/SketchingDev/draw-by-days/tree/master)
[![Coverage Status](https://coveralls.io/repos/github/SketchingDev/draw-by-days/badge.svg?branch=master)](https://coveralls.io/github/SketchingDev/draw-by-days?branch=master)

Draw by Days provides artists (amateur or professional) with an image a day to reproduce in their particular medium. The 
more days you complete the better you'll get - or at least I'm hoping!

## Technologies

 * AWS Lambda / API Gateway / DynamoDB / S3 / SQS
 * Serverless Framework
 * NodeJS / TypeScript / Lerna / Yarn
 * CircleCI

## Overview

 * [Website](packages/website) - Website that displays the images for each day
 * [Daily Image API](packages/daily-image-api) - Provides an API for creating new daily images
 * [Image Storage](packages/image-storage) - Publicly accessible S3 which updates the Daily Image API with the images added to the bucket
 * [Image Ingest](packages/image-ingest) - Scheduled service that ingests an image from external providers and provides it to the Image Storage service 
