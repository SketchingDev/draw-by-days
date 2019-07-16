import laconia from "@laconia/core";
import { SQSHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { EnvDependencies } from "./app/EnvDependencies";
import { AppDependencies } from "./app/creation/AppDependencies";
import { app } from "./app/creation/app";
import { SaveDynamoDbDailyImages } from "./app/creation/storage/SaveDynamoDbDailyImage";
import { validateAddDailyImageCommand } from "./app/creation/validateAddDailyImageCommand";
import { DynamoDbDateIncrementer } from "./app/creation/storage/DynamoDbDailyImageDate";

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
}): AppDependencies => {
  const dateIncrementer = new DynamoDbDateIncrementer(dynamoDb, env.DATE_TABLE_NAME);

  return {
    saveDailyImages: new SaveDynamoDbDailyImages(dynamoDb, dateIncrementer, env.DAILY_IMAGE_TABLE_NAME),
  };
};

export const createDailyImage: SQSHandler = laconia(sqs(validateAddDailyImageCommand(app)))
  .register(awsDependencies)
  .register(appDependencies);
