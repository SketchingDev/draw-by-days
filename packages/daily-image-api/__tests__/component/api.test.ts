import * as serverlessOutput from "../../.serverless/outputs.json";
import axios, { AxiosInstance } from "axios";
import AWS from "aws-sdk";
import uuidv4 from "uuid/v4";
import AsyncRetry from "async-retry";
import { IAddDailyImageCommand } from "draw-by-days-models/lib";

jest.setTimeout(10 * 1000);

describe("Test Daily Image API", () => {
  const retryFiveTimes = {
    retries: 5,
    factor: 1,
  };

  let sqs: AWS.SQS;
  let queueUrl: string;
  let apiClient: AxiosInstance;

  beforeAll(async () => {
    sqs = new AWS.SQS({ region: "us-east-1" });

    const queueName = (<any>serverlessOutput).QueueName;
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl!;

    const baseURL = (<any>serverlessOutput).ServiceEndpoint;
    apiClient = axios.create({ baseURL });
  });

  test("Single image added message saved and returned via query", async () => {
    const imageAdded: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      date: new Date().toISOString().split("T")[0],
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
        data: expect.arrayContaining([
          { id: imageAdded.id, date: new Date(imageAdded.date!).toISOString(), url: imageAdded.url },
        ]),
      });
    }, retryFiveTimes);
  });

  test("Multiple image added message saved and returned via query", async () => {
    const imageAddedMessage1: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      date: new Date().toISOString().split("T")[0],
      url: "http://www.drawbydays.com/test-2",
    };

    const imageAddedMessage2: Readonly<IAddDailyImageCommand> = {
      id: uuidv4(),
      date: new Date().toISOString().split("T")[0],
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
        data: expect.arrayContaining([
          {
            id: imageAddedMessage1.id,
            date: new Date(imageAddedMessage1.date!).toISOString(),
            url: imageAddedMessage1.url,
          },
          {
            id: imageAddedMessage2.id,
            date: new Date(imageAddedMessage2.date!).toISOString(),
            url: imageAddedMessage2.url,
          },
        ]),
      });
    }, retryFiveTimes);
  });
});
