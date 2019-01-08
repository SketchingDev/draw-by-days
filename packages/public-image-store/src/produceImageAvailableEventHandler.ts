import { Callback, Context } from "aws-lambda";
import AWS, { AWSError } from "aws-sdk";
import { PublishInput, PublishResponse } from "aws-sdk/clients/sns";
import { IRecords } from "aws-types-lib";
import { IImageSource } from "messages-lib";
import { throwIfUndefined } from "middy-middleware-lib";

type ResultCallback = Callback<{ result: string; message: string } | null>;

export interface IDeps {
  sns: { publish: (params: PublishInput, callback: (err: AWSError, data: PublishResponse) => void) => void };
  snsTopicArn: string;
}
export const deps = {
  init: (): Promise<IDeps> =>
    Promise.resolve({
      sns: new AWS.SNS({
        apiVersion: "2010-03-31",
        region: "us-east-1",
      }),
      snsTopicArn: throwIfUndefined(process.env.SNS_TOPIC_ARN, "SNS_TOPIC_ARN environment variable not set"),
    }),
};

const transformEvent = (event: IRecords): IImageSource => {
  return {
    imageId: "This is an ID",
    publicUrl: "This is a public URL",
    dimensions: {
      width: 100,
      height: 100,
    },
  };
};

export const produceImageAvailableEventHandler = (event: IRecords, context: Context, callback: ResultCallback) =>
  deps.init().then(({ sns, snsTopicArn }) => {
    const imageSource = transformEvent(event);

    sns.publish({ TopicArn: snsTopicArn, Message: "Hello World" }, (err: AWSError) => {
      if (err) {
        callback(err, undefined);
      } else {
        callback(null, { result: "success", message: "SNS published for THING" });
      }
    });
  });
