import AWS from "aws-sdk";
import uuidv4 from "uuid/v4";
import AsyncRetry = require("async-retry");
import * as serverlessOutput from "../../.serverless/outputs.json";
import axios from "axios";
import { IAddDailyImageCommand } from "daily-image-api-command/lib";

jest.setTimeout(60 * 1000);

describe("Service tests", () => {
  const retryEverySecond = (retries: number, retryMessage: string) => ({
    retries,
    factor: 1,
    onRetry: () => console.log(retryMessage),
  });
  const todaysDate = new Date().toISOString().split("T")[0];
  const region = "us-east-1";

  let s3: AWS.S3;
  let sqs: AWS.SQS;

  let bucketName: string;
  let queueUrl: string;

  beforeAll(async () => {
    s3 = new AWS.S3({ region, apiVersion: "2006-03-01" });
    sqs = new AWS.SQS({ region, apiVersion: "2012-11-05" });

    bucketName = (<any>serverlessOutput).ImagesBucketName;
    const queueName = (<any>serverlessOutput).DailyImageApiQueueName;

    queueUrl = await AsyncRetry(
      async () => (await sqs.createQueue({ QueueName: queueName }).promise()).QueueUrl!,
      retryEverySecond(30, "Creating queue..."),
    );
  });

  afterAll(async () => {
    await sqs.purgeQueue({ QueueUrl: queueUrl }).promise();
    await sqs.deleteQueue({ QueueUrl: queueUrl }).promise();
  });

  afterEach(async () => {
    await deleteContents(bucketName);
  });

  test("Image saved to S3 bucket results in record to SQS", async () => {
    const testObject = { name: uuidv4(), body: uuidv4() };

    await s3.putObject({ Bucket: bucketName, Key: testObject.name, Body: testObject.body }).promise();

    const message = await AsyncRetry(async () => {
      const { Messages } = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();

      expect(Messages).toHaveLength(1);
      return Messages![0];
    }, retryEverySecond(20, "Waiting to receive message..."));

    const imageAddedMessage = JSON.parse(message.Body!) as IAddDailyImageCommand;
    expect(imageAddedMessage).toMatchObject({
      id: testObject.name,
      date: todaysDate,
    });
    expect(axios.get(imageAddedMessage.url!)).resolves.toMatchObject({
      statusText: "OK",
      data: testObject.body,
    });
  });

  const deleteContents = async (bucketName: string) => {
    const objects = await s3.listObjects({ Bucket: bucketName }).promise();

    if (objects.Contents) {
      const objectsToDelete = objects.Contents.map(object => ({ Key: object.Key! }));
      await s3
        .deleteObjects({
          Bucket: bucketName,
          Delete: {
            Objects: objectsToDelete,
          },
        })
        .promise();
    }
  };
});
