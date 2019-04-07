import AWSXRay from "aws-xray-sdk";

import https from "https";
AWSXRay.captureHTTPsGlobal(https);

import { S3CreateEvent, S3Handler } from "aws-lambda";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { AppSyncDailyImageRepo, DailyImageRepository } from "./storage/dailyImageRepo";
import laconia from "@laconia/core";
import { DailyImage } from "./storage/domain/dailyImage";
import { DailyImageEventConverter } from "./storage/dailyImageEventConverter";

interface EnvDependencies {
  baseBucketUrl: string;
  dailyImageApiUrl: string;
  dailyImageApiKey: string;
}

export interface AppDependencies {
  dailyImageRepo: DailyImageRepository;
  eventConverter: DailyImageEventConverter;
}

const instances = ({ env }: { env: EnvDependencies }): AppDependencies => {
  const appSyncClient = new AWSAppSyncClient({
    auth: {
      type: AUTH_TYPE.API_KEY,
      apiKey: env.dailyImageApiKey,
    },
    region: "us-east-1",
    url: env.dailyImageApiUrl,
    disableOffline: true,
  });

  return {
    dailyImageRepo: new AppSyncDailyImageRepo(appSyncClient),
    eventConverter: new DailyImageEventConverter(() => new Date(), env.baseBucketUrl),
  };
};

export const adapter = (app: any) => (event: S3CreateEvent, dependencies: AppDependencies): DailyImage[] => {
  console.log(JSON.stringify(event));

  const converter = dependencies.eventConverter;
  return app(converter.convert(event), dependencies);
};

export const app = async (input: DailyImage[], { dailyImageRepo }: AppDependencies) => {
  await dailyImageRepo.saveAll(input);
};

export const saveDailyImages: S3Handler = laconia(adapter(app)).register(instances);
