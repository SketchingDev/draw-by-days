import * as serverlessOutput from "../../.serverless/outputs.json";
import axios, { AxiosInstance } from "axios";
import AWS from "aws-sdk";
import uuidv4 from "uuid/v4";
import AsyncRetry from "async-retry";
import { IAddDailyImageCommand } from "draw-by-days-models/lib";
import { DynamoDbFixture } from "../DynamoDbFixture";

jest.setTimeout(30 * 1000);

describe("Test Daily Image API", () => {
  const retryFiveTimes = {
    retries: 5,
    factor: 1,
  };

  let sqs: AWS.SQS;
  let queueUrl: string;
  let apiClient: AxiosInstance;
  let dynamoDbFixture: DynamoDbFixture;

  beforeAll(async () => {
    dynamoDbFixture = new DynamoDbFixture(new AWS.DynamoDB({ region: "us-east-1" }));

    sqs = new AWS.SQS({ region: "us-east-1" });

    const queueName = (<any>serverlessOutput).QueueName;
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl!;

    const baseURL = (<any>serverlessOutput).ServiceEndpoint;
    apiClient = axios.create({ baseURL });
  });

  beforeEach(async () => {
    await dynamoDbFixture.purgeTable((<any>serverlessOutput).DailyImageTable);
    await dynamoDbFixture.purgeTable((<any>serverlessOutput).DailyImageDateTable);
  });

  test("Single image added message saved and returned via query", async () => {
    const today = new Date(extractDateOnly(new Date()));

    const imageAdded: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-1",
    };

    await sqs
      .sendMessage({
        MessageBody: JSON.stringify({ ...imageAdded }),
        QueueUrl: queueUrl,
      })
      .promise();

    await AsyncRetry(async () => {
      const response = await apiClient.get("/dailyImage");

      console.log(response);
      expect(response).toMatchObject({
        status: 200,
        data: expect.arrayContaining([{ id: imageAdded.id, date: today.toISOString(), url: imageAdded.url }]),
      });
    }, retryFiveTimes);
  });

  test("Multiple daily images are spread across incrementing days", async () => {
    const today = new Date(extractDateOnly(new Date()));
    const tomorrow = new Date(extractDateOnly(new Date()));
    tomorrow.setDate(tomorrow.getDate() + 1);

    const imageAddedMessage1: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-2",
    };

    const imageAddedMessage2: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-3",
    };

    const params = {
      QueueUrl: queueUrl,
      Entries: [
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({ ...imageAddedMessage1 }),
        },
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({ ...imageAddedMessage2 }),
        },
      ],
    };

    await sqs.sendMessageBatch(params).promise();

    await AsyncRetry(async () => {
      const response = await apiClient.get("/dailyImage");

      console.log(response);

      expect(response).toMatchObject({
        status: 200,
      });
      expect(response.data).toIncludeAnyMembers([
        // SQS isn't ordered, so we cannot determine what date will be used
        {
          date: today.toISOString(),
          id: imageAddedMessage1.id,
          url: imageAddedMessage1.url,
        },
        {
          date: tomorrow.toISOString(),
          id: imageAddedMessage1.id,
          url: imageAddedMessage1.url,
        },

        // SQS isn't ordered, so we cannot determine what date will be used
        {
          date: today.toISOString(),
          id: imageAddedMessage2.id,
          url: imageAddedMessage2.url,
        },
        {
          date: tomorrow.toISOString(),
          id: imageAddedMessage2.id,
          url: imageAddedMessage2.url,
        },
      ]);
    }, retryFiveTimes);
  });

  const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];
});
