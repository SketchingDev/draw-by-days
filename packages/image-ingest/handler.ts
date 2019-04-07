import AWSXRay from "aws-xray-sdk";

import https from "https";
AWSXRay.captureHTTPsGlobal(https);

import laconia from "@laconia/core";
import { ScheduledHandler } from "aws-lambda";
import { EnvDependencies } from "./app/dependencies";
import { searchImages } from "pixabay-api";
import { ingestImage } from "./app/ingestImage";
import { saveRemoteFileToS3Factory } from "./app/storage/saveImageToBucket";
import { pixabayGetRandomImageFactory } from "./app/image/pixabay/pixabayGetRandomImageFactory";
import { randomHitSelector } from "./app/image/pixabay/randomHitSelector";
import AWS from "aws-sdk";

const pixabayIngesterDependencies = ({ env }: { env: EnvDependencies }) => {
  const s3 = AWSXRay.captureAWSClient(new AWS.S3({ apiVersion: "2006-03-01" }));

  return {
    getRandomImage: pixabayGetRandomImageFactory(searchImages, env.pixabayApiKey, randomHitSelector),
    remoteUrlS3Saver: saveRemoteFileToS3Factory(s3, env.imageStorageBucketName),
  };
};

export const pixabayImageIngester: ScheduledHandler = laconia(ingestImage).register(pixabayIngesterDependencies);
