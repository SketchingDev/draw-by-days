#!/usr/bin/env bash


# WIP

exec 5>&1
OUTPUT=$($($1 | RESULT=$?) | tee >(cat - >&5))

#RESULT=$?

#OUTPUT=$($1)
#RESULT=$?

echo "Result is $RESULT"

#if [[ ${RESULT} -ne 0 ]]; then
#  if [[ ${OUTPUT} == *"$2"* ]]; then
#    echo "Command failed but expected string found"
#    RESULT=0
#  fi
#fi

exit ${RESULT}


# "does not exist"
