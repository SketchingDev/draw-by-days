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

    const addImage: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-1",
    };

    await sqs
      .sendMessage({
        MessageBody: JSON.stringify({ ...addImage }),
        QueueUrl: queueUrl,
      })
      .promise();

    await AsyncRetry(async () => {
      const response = await apiClient.get(`/dailyImage/${extractDateOnly(new Date())}`);

      console.log(response);
      expect(response).toMatchObject({
        status: 200,
        data: expect.arrayContaining([{ id: addImage.id, date: today.toISOString(), url: addImage.url }]),
      });
    }, retryFiveTimes);
  });

  test("Multiple daily images are spread across incrementing days", async () => {
    const today = new Date(extractDateOnly(new Date()));
    const tomorrow = new Date(extractDateOnly(new Date()));
    tomorrow.setDate(tomorrow.getDate() + 1);

    const addImageMessage1: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-2",
    };

    const addImagMessage2: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      url: "http://www.drawbydays.com/test-3",
    };

    const params = {
      QueueUrl: queueUrl,
      Entries: [
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({ ...addImageMessage1 }),
        },
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({ ...addImagMessage2 }),
        },
      ],
    };

    await sqs.sendMessageBatch(params).promise();

    await AsyncRetry(async () => {
      const responseForToday = await apiClient.get(`/dailyImage/${extractDateOnly(today)}`);
      expect(responseForToday).toMatchObject({
        status: 200,
        data: expect.toIncludeAnyMembers([
          // SQS isn't ordered, so we cannot determine what date will be used
          {
            date: today.toISOString(),
            id: addImageMessage1.id,
            url: addImageMessage1.url,
          },
          {
            date: today.toISOString(),
            id: addImagMessage2.id,
            url: addImagMessage2.url,
          },
        ]),
      });

      const responseForTomorrow = await apiClient.get(`/dailyImage/${extractDateOnly(tomorrow)}`);

      console.log(responseForTomorrow);

      expect(responseForTomorrow).toMatchObject({
        status: 200,
      });
      expect(responseForTomorrow.data).toIncludeAnyMembers([
        // SQS isn't ordered, so we cannot determine what date will be used
        {
          date: tomorrow.toISOString(),
          id: addImageMessage1.id,
          url: addImageMessage1.url,
        },
        {
          date: tomorrow.toISOString(),
          id: addImagMessage2.id,
          url: addImagMessage2.url,
        },
      ]);
    }, retryFiveTimes);
  });

  const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];
});
