import AWS from "aws-sdk";
import { QueueArn } from "aws-sdk/clients/s3";
import { ReceiveMessageRequest, ReceiveMessageResult } from "aws-sdk/clients/sqs";
import { IRecords } from "aws-types-lib";
import lambdaTester = require("lambda-tester");
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { handler } from "../main";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const snsEndpoint = "http://0.0.0.0:4575";
const sqsEndpoint = "http://0.0.0.0:4576";

AWS.config.update({
  accessKeyId: "AKID",
  secretAccessKey: "SECRET",
  region: "us-east-1",
});

const sns = new AWS.SNS({ apiVersion: "2010-03-31", endpoint: snsEndpoint });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05", endpoint: sqsEndpoint });

const snsAndSqsToRespond = async () => await Promise.all([sns.listTopics().promise(), sqs.listQueues().promise()]);

const getQueueArn = async (queueUrl: string) => {
  const queueAttributesParams = {
    QueueUrl: queueUrl,
    AttributeNames: ["QueueArn"],
  };
  const queueAttributes = await sqs.getQueueAttributes(queueAttributesParams).promise();
  return queueAttributes.Attributes!.QueueArn;
};

const jestDefaultTimeout = 5000;
const waitForLocalStackTimeout = 10000;
jest.setTimeout(waitForLocalStackTimeout + jestDefaultTimeout);

describe("Produces ImageAvailable event from S3 'create' event", () => {
  let snsTopicArn: string;
  let receiveMessagesParams: ReceiveMessageRequest;

  beforeAll(async () => {
    await waitForExpect(snsAndSqsToRespond, waitForLocalStackTimeout);
  });

  beforeEach(async () => {
    const createdTopic = await sns.createTopic({ Name: uuidv4() }).promise();
    const createdQueue = await sqs.createQueue({ QueueName: uuidv4() }).promise();

    const subscribeParams = {
      Protocol: "sqs",
      TopicArn: createdTopic.TopicArn!,
      Endpoint: await getQueueArn(createdQueue.QueueUrl!),
    };
    await sns.subscribe(subscribeParams).promise();

    receiveMessagesParams = { QueueUrl: createdQueue.QueueUrl! };

    snsTopicArn = createdTopic.TopicArn!;
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
              key: "florence-1129553.jpg",
              size: 1642847,
              eTag: "8e81bdf6f079dd056f5f548b0a0e039d",
            },
          },
        },
      ],
    };

    process.env.SNS_ENDPOINT = snsEndpoint;
    process.env.SNS_TOPIC_ARN = snsTopicArn;

    return lambdaTester(handler)
      .event(s3Event)
      .expectResult(async () => {
        let response: ReceiveMessageResult;
        await waitForExpect(async () => {
          response = await sqs.receiveMessage(receiveMessagesParams).promise();
          expect(response.Messages).toBeDefined();
        });

        const messages = response!.Messages!;

        expect(messages.length).toBe(1);

        const message = messages[0];
        const body = JSON.parse(message.Body!);

        expect(body.Message).toEqual("Hello World");
      });
  });
});
