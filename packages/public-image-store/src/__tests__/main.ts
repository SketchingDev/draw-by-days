import AWS from "aws-sdk";
import { QueueArn } from "aws-sdk/clients/s3";
import { ReceiveMessageResult } from "aws-sdk/clients/sqs";
import { IRecords } from "aws-types-lib";
import lambdaTester = require("lambda-tester");
import { IImageSource } from "messages-lib";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { handler } from "../main";
import { deps, IDeps } from "../produceImageAvailableEventHandler";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const defaultJestTimeout = 5 * 1000;
const localStackStartupTimeout = 10 * 1000;
jest.setTimeout(defaultJestTimeout + localStackStartupTimeout);

const localSnsEndpoint = "http://0.0.0.0:4575";
const localSqsEndpoint = "http://0.0.0.0:4576";

const configureForLocalEnvironment = () => {
  AWS.config.update({
    accessKeyId: "AKID",
    secretAccessKey: "SECRET",
    region: "us-east-1",
  });
};

const snsAndSqsToRespond = (sns: AWS.SNS, sqs: AWS.SQS) => async () =>
  await Promise.all([sns.listTopics().promise(), sqs.listQueues().promise()]);

const getQueueArn = async (sqs: AWS.SQS, queueUrl: string) => {
  const queueAttributesParams = {
    QueueUrl: queueUrl,
    AttributeNames: ["QueueArn"],
  };
  const queueAttributes = await sqs.getQueueAttributes(queueAttributesParams).promise();
  return queueAttributes.Attributes!.QueueArn;
};

describe("Produces ImageAvailable event from S3 'create' event", () => {
  let sns: AWS.SNS;
  let sqs: AWS.SQS;
  let sqsQueueUrl: string;

  beforeAll(async () => {
    configureForLocalEnvironment();
    sns = new AWS.SNS({ apiVersion: "2010-03-31", endpoint: localSnsEndpoint });
    sqs = new AWS.SQS({ apiVersion: "2012-11-05", endpoint: localSqsEndpoint });

    await waitForExpect(snsAndSqsToRespond(sns, sqs), localStackStartupTimeout);
  });

  beforeEach(async () => {
    const createdTopic = await sns.createTopic({ Name: uuidv4() }).promise();
    const createdQueue = await sqs.createQueue({ QueueName: uuidv4() }).promise();

    const subscribeParams = {
      Protocol: "sqs",
      TopicArn: createdTopic.TopicArn!,
      Endpoint: await getQueueArn(sqs, createdQueue.QueueUrl!),
    };
    await sns.subscribe(subscribeParams).promise();

    sqsQueueUrl = createdQueue.QueueUrl!;

    deps.init = (): Promise<IDeps> =>
      Promise.resolve({
        sns,
        snsTopicArn: createdTopic.TopicArn!,
        bucketPublicUrl: "http://example.com/",
      });
  });

  it("Succeeds with publicUrl of image from event", async () => {
    const s3Event: IRecords = {
      Records: [
        {
          eventSource: "aws:s3",
          s3: {
            bucket: {
              name: "draw-by-days-ci-public-images",
              arn: "arn:aws:s3:::test-bucket",
            },
            object: {
              key: "florence.jpg",
              size: 1642847,
              eTag: "8e81bdf6f079dd056f5f548b0a0e039d",
            },
          },
        },
      ],
    };

    return lambdaTester(handler)
      .event(s3Event)
      .expectResult(async () => {
        let response: ReceiveMessageResult;
        await waitForExpect(async () => {
          response = await sqs.receiveMessage({ QueueUrl: sqsQueueUrl }).promise();
          expect(response.Messages).toBeDefined();
        });

        const messages = response!.Messages!;

        expect(messages.length).toBe(1);

        const message = messages[0];
        const body = JSON.parse(message.Body!);

        const messageInBody: IImageSource = JSON.parse(body.Message);
        expect(messageInBody).toMatchObject({
          publicUrl: "http://example.com/florence.jpg",
        });
      });
  });
});
