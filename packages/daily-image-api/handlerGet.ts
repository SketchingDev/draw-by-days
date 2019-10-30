import laconia from "@laconia/core";
import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from "aws-sdk";
import { EnvDependencies } from "./app/EnvDependencies";
import { AppDependencies } from "./app/query/AppDependencies";
import { app } from "./app/query/app";
import { ReadDynamoDbDailyImages } from "./app/query/storage/ReadDynamoDbDailyImages";
import { apiGatewayAdapter } from "./app/query/http/apiGatewayAdapter";
import AWSXRay from "aws-xray-sdk";

const awsDependencies = ({ env }: { env: EnvDependencies }) => ({
  dynamoDb: AWSXRay.captureAWSClient(new AWS.DynamoDB({ region: env.REGION })),
});

export const appDependencies = ({
  dynamoDb,
  env,
}: {
  dynamoDb: AWS.DynamoDB;
  env: EnvDependencies;
}): AppDependencies => ({
  dailyImageRepository: new ReadDynamoDbDailyImages(dynamoDb, env.DAILY_IMAGE_TABLE_NAME),
});

export const logEvent = (next: any) => async (event: any, ...args: any[]) => {
  console.log(event);
  return await next(event, ...args);
};

export const getDailyImage: APIGatewayProxyHandler = laconia(logEvent(apiGatewayAdapter(app)))
  .register(awsDependencies)
  .register(appDependencies);
