import { ScheduledHandler } from "aws-lambda";
import { TwitTwitter } from "./src/tweets/TwitTwitter";
import { DynamoDbTweetsRepo } from "./src/tweets/DynamoDbTweetsRepo";
import Twit from "twit";
import { app, Dependencies } from "./src/App";
import { DynamoDB, S3 } from "aws-sdk";
import getenv from "getenv";
import { errorHandler } from "./src/errorHandler";

const dynamoDb = new DynamoDB({ region: getenv("AWS_REGION") });
const s3 = new S3({region: getenv("AWS_REGION")});

const twit = new Twit({
  consumer_key: getenv("TWITTER_CONSUMER_KEY"),
  consumer_secret: getenv("TWITTER_CONSUMER_SECRET"),
  access_token: getenv("TWITTER_ACCESS_TOKEN"),
  access_token_secret: getenv("TWITTER_TOKEN_SECRET")
});

const dependencies: Dependencies = {
  tweetsRepo: new DynamoDbTweetsRepo(dynamoDb, getenv("IMAGE_INFO_TABLE_NAME")),
  imageTweeter: new TwitTwitter(twit),
  imageStorageBucketName: getenv("IMAGE_STORAGE_BUCKET_NAME"),
  s3
};

export const tweeter: ScheduledHandler = errorHandler(app(dependencies));
