import laconia from "@laconia/core";
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { EnvDependencies } from "./app/EnvDependencies";
import { AppDependencies } from "./app/creation/AppDependencies";
import { app } from "./app/creation/app";
import { SaveDynamoDbDailyImages } from "./app/creation/storage/SaveDynamoDbDailyImage";
import { validateDailyImageAddedMessage } from "./app/creation/validateDailyImageAddedMessage";

const sqs = require("@laconia/adapter").sqs();

const awsDependencies = ({ env }: { env: EnvDependencies }) => ({
  dynamoDb: new AWS.DynamoDB({ region: env.REGION }),
});

export const appDependencies = ({
  dynamoDb,
  env,
}: {
  dynamoDb: AWS.DynamoDB;
  env: EnvDependencies;
}): AppDependencies => ({
  saveDailyImages: new SaveDynamoDbDailyImages(dynamoDb, env.TABLE_NAME),
});

export const createDailyImage: APIGatewayProxyHandler = laconia(sqs(validateDailyImageAddedMessage(app)))
  .register(awsDependencies)
  .register(appDependencies);
