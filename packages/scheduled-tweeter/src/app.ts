import { ImageTweeter, Tweet } from "./tweets/TwitTwitter";
import { TweetsRepo } from "./tweets/DynamoDbTweetsRepo";
import { ScheduledHandler } from "aws-lambda";
import { S3 } from "aws-sdk";
import * as fs from "fs";
import * as path from "path";
import { fileSync } from "tmp";
import { Readable } from "stream";

export interface Dependencies {
  imageTweeter: ImageTweeter;
  tweetsRepo: TweetsRepo;
  s3: Pick<S3, "getObject">;
  imageStorageBucketName: string;
}

export class ErrorDownloadingFile extends Error {
  constructor(message: string,
              public readonly source: string,
              public readonly destination: string) {
    super(message);
  }
}

export class ErrorPostingTweet extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const app = (dependencies: Dependencies): ScheduledHandler => async () => {
  const { imageTweeter, tweetsRepo, s3, imageStorageBucketName } = dependencies;

  const imageToTweet = await tweetsRepo.getImageToTweet();
  if (!imageToTweet) {
    throw new Error("No image available to tweet");
  }

  const params = {
    Bucket: imageStorageBucketName,
    Key: imageToTweet.content.media.s3Key
  };
  const readStream = s3.getObject(params).createReadStream();
  const outputFile = fileSync({ postfix: path.extname(params.Key) });

  try {
    await writeStreamToFile(readStream, outputFile);
  } catch (error) {
    const source = `bucket=${params.Bucket}, key=${params.Key}`;
    throw new ErrorDownloadingFile(error.message, source, outputFile.name);
  }

  let tweet: Tweet;
  try {
    tweet = await imageTweeter.tweetImage(imageToTweet.content.text, outputFile.name);
  } catch (error) {
      throw new ErrorPostingTweet(error.message);
  }

  await tweetsRepo.markImageAsTweeted(imageToTweet, tweet.id);
};

const writeStreamToFile = async (readStream: Readable, file: { name: string }) => {
  const writeStream = fs.createWriteStream(file.name);

  await new Promise((resolve, reject) => {
    readStream.on("end", () => resolve());
    readStream.on("error", error => reject(error));
    readStream.pipe(writeStream);
  });
};
