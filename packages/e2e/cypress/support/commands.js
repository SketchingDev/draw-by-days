import * as AWS from "aws-sdk";

const lambda = new AWS.Lambda({
  region: "us-east-1",
  credentials: {
    accessKeyId: Cypress.env("AWS_ACCESS_KEY_ID"),
    secretAccessKey: Cypress.env("AWS_SECRET_ACCESS_KEY"),
  },
});

Cypress.Commands.add("invokeLambda", functionName => {
  return lambda.invoke({ FunctionName: functionName }).promise();
});
