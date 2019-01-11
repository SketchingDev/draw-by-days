import { Callback, Context } from "aws-lambda";
import AWS, { AWSError } from "aws-sdk";
import { PublishInput, PublishResponse } from "aws-sdk/clients/sns";
import { IS3Record } from "aws-types-lib";
import { IImageSource } from "messages-lib";
import { throwIfUndefined } from "middy-middleware-lib";
import * as url from "url";

type ResultCallback = Callback<{ result: string; message: string } | null>;

export interface IDeps {
  sns: { publish: (params: PublishInput, callback: (err: AWSError, data: PublishResponse) => void) => void };
  snsTopicArn: string;
  bucketPublicUrl: string;
}
export const deps = {
  init: (): Promise<IDeps> =>
    Promise.resolve({
      sns: new AWS.SNS({
        apiVersion: "2010-03-31",
        region: "us-east-1",
      }),
      snsTopicArn: throwIfUndefined(process.env.SNS_TOPIC_ARN, "SNS_TOPIC_ARN environment variable not set"),
      bucketPublicUrl: throwIfUndefined(process.env.BUCKET_PUBLIC_URL, "BUCKET_PUBLIC_URL environment variable not set"),
    }),
};

const transformEvent = (bucketPublicUrl: string, event: IS3Record): IImageSource => {
  const objectPublicUrl = url.resolve(bucketPublicUrl, event.s3.object.key);

  return {
    imageId: event.s3.object.key,
    publicUrl: objectPublicUrl,
  };
};

export const produceImageAvailableEventHandler = (event: IS3Record, context: Context, callback: ResultCallback) =>
  deps.init().then(({ sns, snsTopicArn, bucketPublicUrl }) => {
    const imageSource = transformEvent(bucketPublicUrl, event);

    sns.publish({ TopicArn: snsTopicArn, Message: JSON.stringify(imageSource) }, (err: AWSError) => {
      if (err) {
        callback(err, undefined);
      } else {
        callback(null, { result: "success", message: `SNS published for ${imageSource.imageId}` });
      }
    });
  });
