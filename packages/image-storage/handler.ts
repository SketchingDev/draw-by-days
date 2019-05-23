import AWSXRay from "aws-xray-sdk";
import { S3Handler } from "aws-lambda";
import { SqsDailyImageRepo } from "./storage/SqsDailyImageRepo";
import laconia from "@laconia/core";
import { DailyImage } from "./storage/domain/dailyImage";
import AWS from "aws-sdk";
import https from "https";
import { s3CreateEventToDailyImage } from "./storage/s3CreateEventToDailyImage";
import { DailyImageRepository } from "./storage/DailyImageRepository";

export interface EnvDependencies {
  REGION: string;
  BASE_BUCKET_URL: string;
  DAILY_IMAGE_SQS_QUEUE_NAME: string;
}

export type DateGenerator = () => Date;

export interface AppDependencies {
  dailyImageRepo: DailyImageRepository;
  dateGenerator: DateGenerator;
}

const awsDependencies = ({ env }: { env: EnvDependencies }) => {
  AWSXRay.captureHTTPsGlobal(https);
  return { sqs: AWSXRay.captureAWSClient(new AWS.SQS({ region: env.REGION })) };
};

export const appDependencies = async ({
  sqs,
  env,
}: {
  sqs: AWS.SQS;
  env: EnvDependencies;
}): Promise<AppDependencies> => {
  const getQueueUrlResponse = await sqs.getQueueUrl({ QueueName: env.DAILY_IMAGE_SQS_QUEUE_NAME }).promise();
  if (!getQueueUrlResponse.QueueUrl) {
    throw new Error(`Queue URL for ${env.DAILY_IMAGE_SQS_QUEUE_NAME} is undefined`);
  }

  return {
    dailyImageRepo: new SqsDailyImageRepo(sqs, getQueueUrlResponse.QueueUrl),
    dateGenerator: () => new Date(),
  };
};

export const app = async (input: DailyImage[], { dailyImageRepo }: AppDependencies) => {
  await dailyImageRepo.saveAll(input);
};

export const saveDailyImages: S3Handler = laconia(s3CreateEventToDailyImage(app))
  .register(awsDependencies)
  .register(appDependencies);
