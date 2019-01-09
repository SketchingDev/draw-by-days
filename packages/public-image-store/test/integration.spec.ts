import AWS from "aws-sdk";
import { ReceiveMessageResult } from "aws-sdk/clients/sqs";
import axios from "axios";
import { IImageSource } from "messages-lib";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";

const waitForSqsMessageTimeout = 10 * 1000;
jest.setTimeout(waitForSqsMessageTimeout * 2);

const sqsPollInterval = 3 * 1000;

const getQueueArn = async (sqs: AWS.SQS, queueUrl: string) => {
  const queueAttributesParams = {
    QueueUrl: queueUrl,
    AttributeNames: ["QueueArn"],
  };
  const queueAttributes = await sqs.getQueueAttributes(queueAttributesParams).promise();
  return queueAttributes.Attributes!.QueueArn;
};

const createPermissiveSqsPolicy = (resourceArn: string, sourceArn: string) => ({
  Statement: [
    {
      Effect: "Allow",
      Principal: {
        AWS: "*",
      },
      Action: "SQS:SendMessage",
      Resource: resourceArn,
      Condition: {
        ArnEquals: {
          "aws:SourceArn": sourceArn,
        },
      },
    },
  ],
});

const assertInputEnvVariablesSet = () => {
  expect(process.env.AWS_REGION).toBeDefined();
  expect(process.env.TF_OUTPUT_bucket_name).toBeDefined();
  expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
};

describe("Public Image Store integration test", () => {
  let sns: AWS.SNS;
  let sqs: AWS.SQS;
  let s3: AWS.S3;

  beforeAll(() => {
    sns = new AWS.SNS({ apiVersion: "2010-03-31" });
    sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
    s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  });

  let createdBucketKey: AWS.S3.ManagedUpload.SendData;
  let subscription: AWS.SNS.SubscribeResponse;
  let createdQueue: AWS.SQS.CreateQueueResult;

  beforeEach(async () => {
    assertInputEnvVariablesSet();

    createdQueue = await sqs.createQueue({ QueueName: uuidv4() }).promise();

    const createdQueueArn = await getQueueArn(sqs, createdQueue.QueueUrl!);
    const policy = createPermissiveSqsPolicy(createdQueueArn, process.env.TF_OUTPUT_subscribed_topic_arn!);
    const setSqsPolicyParams = {
      QueueUrl: createdQueue.QueueUrl!,
      Attributes: {
        Policy: JSON.stringify(policy),
      },
    };
    await sqs.setQueueAttributes(setSqsPolicyParams).promise();
  });

  afterEach(async () => {
    await sns.unsubscribe({ SubscriptionArn: subscription.SubscriptionArn! }).promise();
    await sqs.deleteQueue({ QueueUrl: createdQueue.QueueUrl! }).promise();

    const deleteObjectParams = {
      Bucket: createdBucketKey.Bucket,
      Key: createdBucketKey.Key,
    };
    await s3.deleteObject(deleteObjectParams).promise();
  });

  it("Event published containing public URL to S3 object", async () => {
    const subscribeParams = {
      Protocol: "sqs",
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn!,
      Endpoint: await getQueueArn(sqs, createdQueue.QueueUrl!),
    };
    subscription = await sns.subscribe(subscribeParams).promise();

    const objectKey = `${uuidv4()}.txt`;
    const objectBody = uuidv4();
    const uploadParams = {
      Bucket: process.env.TF_OUTPUT_bucket_name!,
      Key: objectKey,
      Body: objectBody,
    };
    createdBucketKey = await s3.upload(uploadParams).promise();

    let response: ReceiveMessageResult;
    await waitForExpect(
      async () => {
        response = await sqs.receiveMessage({ QueueUrl: createdQueue.QueueUrl! }).promise();
        expect(response.Messages).toBeDefined();
      },
      waitForSqsMessageTimeout,
      sqsPollInterval,
    );

    const messages = response!.Messages!;
    expect(messages.length).toBe(1);

    const message = messages[0];
    const body = JSON.parse(message.Body!);

    const messageInBody: IImageSource = JSON.parse(body.Message);
    expect(messageInBody.imageId).toBe(objectKey);

    const result = await axios.get(messageInBody.publicUrl);
    expect(result.data).toBe(objectBody);
  });
});
