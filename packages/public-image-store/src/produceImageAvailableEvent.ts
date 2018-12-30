import { Callback, Context } from "aws-lambda";
import AWS from "aws-sdk";
import { IRecords } from "aws-types-lib";
import { IImageSource } from "messages-lib";

type ResultCallback = Callback<{ result: string; message: string } | null>;

export const produceImageAvailableEvent = (event: IRecords, context: Context, callback: ResultCallback) => {
  const { SNS_ENDPOINT, SNS_TOPIC_ARN } = process.env;

  const sns = new AWS.SNS({
    apiVersion: "2010-03-31",
    region: "us-east-1",
    endpoint: SNS_ENDPOINT,
  });

  const abc: IImageSource = {
    imageId: "This is an ID",
    publicUrl: "This is a public URL",
    dimensions: {
      width: 100,
      height: 100,
    },
  };

  sns.publish({ TopicArn: SNS_TOPIC_ARN, Message: "Hello World" }, err => {
    if (err) {
      callback(err, undefined);
    } else {
      callback(null, { result: "success", message: "SNS published for THING" });
    }
  });
};
