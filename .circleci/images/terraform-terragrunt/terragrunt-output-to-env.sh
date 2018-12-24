#!/usr/bin/env bash

for var in "$@"
do
    terraform_output=`terragrunt output ${var}`
    if [[ $? -eq 0 ]];
    then
        echo "export TF_OUTPUT_$var=$terraform_output"
    else
        exit 1
    fi
done
