import { S3CreateEvent, S3EventRecord } from "aws-lambda";
import AWS from "aws-sdk";
import laconia from "@laconia/core";
import { app, appDependencies } from "../../handler";
import lambdaTester = require("lambda-tester");
import { s3CreateEventToDailyImage } from "../../storage/s3CreateEventToDailyImage";
import uuidv4 from "uuid/v4";
import AsyncRetry = require("async-retry");
import { IAddDailyImageCommand } from "draw-by-days-models/lib";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

jest.setTimeout(30 * 1000);

describe("Handler tests", () => {
  const todaysDate = new Date().toISOString().split("T")[0];
  const localSqsConfig = {
    region: "us-east-1",
    apiVersion: "2012-11-05",
    endpoint: "http://localhost:4576",
    credentials: {
      accessKeyId: "ACCESSKEYID",
      secretAccessKey: "SECRETACCESSKEY",
    },
  };

  let sqs: AWS.SQS;
  let sqsQueueName: string;
  let sqsQueueUrl: string;

  beforeAll(async () => {
    sqs = new AWS.SQS(localSqsConfig);
    await waitForSqs();
  });

  beforeEach(async () => {
    sqsQueueName = uuidv4();
    const result = await sqs.createQueue({ QueueName: sqsQueueName }).promise();
    sqsQueueUrl = result.QueueUrl!;
  });

  afterEach(async () => {
    await sqs.deleteQueue({ QueueUrl: sqsQueueUrl }).promise();
  });

  test("S3 creation events converted to Image Added events and posted queue", async () => {
    const s3CreateEvent: S3CreateEvent = {
      Records: [
        createS3CreateRecord("image-1-created.png"),
        createS3CreateRecord("image-2-created.png"),
        createS3CreateRecord("image-3-created.png"),
      ],
    };

    const handler = createHandler(sqs, sqsQueueName);

    return lambdaTester(handler)
      .event(s3CreateEvent)
      .expectResult(async () => {
        const message = await sqs
          .receiveMessage({ QueueUrl: sqsQueueUrl, MaxNumberOfMessages: 3, WaitTimeSeconds: 5 })
          .promise();
        expect(message.Messages).toBeDefined();

        const messages = message.Messages!.map(({ Body }) => JSON.parse(Body!) as IAddDailyImageCommand);
        expect(messages).toEqual(
          expect.arrayContaining([
            { id: "image-1-created.png", date: todaysDate, url: "http://drawbydays.test/image-1-created.png" },
            { id: "image-2-created.png", date: todaysDate, url: "http://drawbydays.test/image-2-created.png" },
            { id: "image-3-created.png", date: todaysDate, url: "http://drawbydays.test/image-3-created.png" },
          ]),
        );
      });
  });

  const createS3CreateRecord = (objectKey: string): S3EventRecord => ({
    awsRegion: "",
    eventName: "",
    eventSource: "",
    eventTime: "",
    eventVersion: "",
    requestParameters: { sourceIPAddress: "" },
    responseElements: {
      "x-amz-request-id": "",
      "x-amz-id-2": "",
    },
    s3: {
      bucket: { arn: "", name: "", ownerIdentity: { principalId: "" } },
      configurationId: "",
      object: { eTag: "", key: objectKey, sequencer: "", size: 0, versionId: "" },
      s3SchemaVersion: "",
    },
    userIdentity: { principalId: "" },
  });

  const createHandler = (sqs: AWS.SQS, sqsName: string) =>
    laconia(s3CreateEventToDailyImage(app))
      .register(() => ({
        env: {
          REGION: "",
          BASE_BUCKET_URL: "http://drawbydays.test/",
          DAILY_IMAGE_SQS_QUEUE_NAME: sqsName,
        },
      }))
      .register(() => ({ sqs }))
      .register(appDependencies);

  const waitForSqs = async () =>
    await AsyncRetry(async () => await sqs.listQueues().promise(), { onRetry: () => console.log("Waiting for SQS...") });
});
