#!/usr/bin/env bash
set -e

# TODO This is unnecessary if the Daily-Image API has a hostname and a public endpoint

# 1. Extract API URL and Key from Daily Image API stack
source scripts/fetchenv.sh daily-image-api-dev

export REACT_APP_DAILY_IMAGE_API_URL=$GraphQlApiUrl
export REACT_APP_DAILY_IMAGE_API_KEY=$GraphQlApiKeyDefault
