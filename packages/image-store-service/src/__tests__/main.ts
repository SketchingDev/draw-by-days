import AWS from "aws-sdk";
import { QueueArn } from "aws-sdk/clients/s3";
import { ReceiveMessageResult } from "aws-sdk/clients/sqs";
import { IRecords } from "aws-types-lib";
import lambdaTester = require("lambda-tester");
import { IImageSource } from "messages-lib/lib/messages/imageSource";
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

const pollQueueForMessage = async (sqs: AWS.SQS, sqsQueueUrl: string): Promise<ReceiveMessageResult> => {
  let message: ReceiveMessageResult;

  await waitForExpect(async () => {
    message = await sqs.receiveMessage({ QueueUrl: sqsQueueUrl }).promise();
    expect(message.Messages).toBeDefined();
  });

  return Promise.resolve(message!);
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

  it("Publishes event with ID and public URL for the uploaded file", async () => {
    const s3Event: IRecords = {
      Records: [
        {
          eventSource: "aws:s3",
          s3: {
            bucket: {
              name: "",
              arn: "",
            },
            object: {
              key: "florence.jpg",
              size: 0,
              eTag: "",
            },
          },
        },
      ],
    };

    return lambdaTester(handler)
      .event(s3Event)
      .expectResult(async () => {
        const { Messages } = await pollQueueForMessage(sqs, sqsQueueUrl);
        expect(Messages).toBeDefined();

        expect(Messages).toHaveLength(1);
        const body = JSON.parse(Messages![0].Body!);

        const messageInBody: IImageSource = JSON.parse(body.Message);
        expect(messageInBody).toMatchObject({
          imageId: "florence.jpg",
          publicUrl: "http://example.com/florence.jpg",
        });
      });
  });
});
