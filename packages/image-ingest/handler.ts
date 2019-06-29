import AWSXRay from "aws-xray-sdk";
import AWS from "aws-sdk";
import https from "https";
import laconia from "@laconia/core";
import { ScheduledHandler } from "aws-lambda";
import { EnvDependencies } from "./app/dependencies";
import { searchImages } from "pixabay-api";
import { ingestImage } from "./app/ingestImage";
import { saveRemoteFileToS3Factory } from "./app/storage/saveImageToBucket";
import { pixabayGetRandomImageFactory } from "./app/image/pixabay/pixabayGetRandomImageFactory";
import { randomHitSelector } from "./app/image/pixabay/randomHitSelector";

const awsDependencies = () => {
  AWSXRay.captureHTTPsGlobal(https);
  return {
    s3: AWSXRay.captureAWSClient(new AWS.S3({ apiVersion: "2006-03-01" })),
  };
};

export const pixabayIngesterDependencies = ({ s3, env }: { s3: AWS.S3; env: EnvDependencies }) => {
  return {
    getRandomImage: pixabayGetRandomImageFactory(searchImages, env.PIXABAY_API_KEY, randomHitSelector),
    remoteUrlS3Saver: saveRemoteFileToS3Factory(s3, env.IMAGE_STORAGE_BUCKET_NAME),
  };
};

export const pixabayImageIngester: ScheduledHandler = laconia(ingestImage)
  .register(awsDependencies)
  .register(pixabayIngesterDependencies);
