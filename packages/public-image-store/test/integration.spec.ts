import AWS from "aws-sdk";
import { ReceiveMessageResult } from "aws-sdk/clients/sqs";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";

const waitForLocalStackTimeout = 60000;
// const defaultTimeout = 5000;
jest.setTimeout(waitForLocalStackTimeout * 4);

const getQueueArn = async (queueUrl: string) => {
  const queueAttributesParams = {
    QueueUrl: queueUrl,
    AttributeNames: ["QueueArn"],
  };
  const queueAttributes = await sqs.getQueueAttributes(queueAttributesParams).promise();
  return queueAttributes.Attributes!.QueueArn;
};

const sns = new AWS.SNS({ apiVersion: "2010-03-31" });
const sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

describe("Public Image Store integration test", () => {
  beforeAll(() => {
    expect(process.env.AWS_REGION).toBeDefined();
    expect(process.env.TF_OUTPUT_bucket_name).toBeDefined();
    expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
  });

  let createdBucketKey: AWS.S3.ManagedUpload.SendData;
  let subscription: AWS.SNS.SubscribeResponse;
  let createdQueue: AWS.SQS.CreateQueueResult;
  beforeEach(async () => {
    createdQueue = await sqs.createQueue({ QueueName: uuidv4() }).promise();

    const policyDocument = {
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: "*",
          },
          Action: "SQS:SendMessage",
          Resource: await getQueueArn(createdQueue.QueueUrl!),
          Condition: {
            ArnEquals: {
              "aws:SourceArn": process.env.TF_OUTPUT_subscribed_topic_arn,
            },
          },
        },
      ],
    };

    const paramsTwo = {
      QueueUrl: createdQueue.QueueUrl!,
      Attributes: {
        Policy: JSON.stringify(policyDocument),
      },
    };
    await sqs.setQueueAttributes(paramsTwo).promise();
  });

  afterEach(async () => {
    await sns.unsubscribe({ SubscriptionArn: subscription.SubscriptionArn! }).promise();
    await sqs.deleteQueue({ QueueUrl: createdQueue.QueueUrl! }).promise();

    const params = {
      Bucket: createdBucketKey.Bucket,
      Key: createdBucketKey.Key,
    };
    await s3.deleteObject(params).promise();
  });

  it("Details in event saved to DynamoDB", async () => {
    const subscribeParams = {
      Protocol: "sqs",
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn!,
      Endpoint: await getQueueArn(createdQueue.QueueUrl!),
    };
    subscription = await sns.subscribe(subscribeParams).promise();

    const params = {
      Bucket: process.env.TF_OUTPUT_bucket_name!,
      Key: `${uuidv4()}.txt`,
      Body: "Contents of file",
    };
    createdBucketKey = await s3.upload(params).promise();

    let response: ReceiveMessageResult;
    await waitForExpect(
      async () => {
        response = await sqs.receiveMessage({ QueueUrl: createdQueue.QueueUrl! }).promise();
        expect(response.Messages).toBeDefined();
      },
      waitForLocalStackTimeout,
      3000,
    );

    const messages = response!.Messages!;

    expect(messages.length).toBe(1);

    const message = messages[0];
    const body = JSON.parse(message.Body!);

    expect(body.Message).toEqual("Hello World");
  });
});
