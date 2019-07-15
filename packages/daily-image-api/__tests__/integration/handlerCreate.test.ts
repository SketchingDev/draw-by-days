import * as config from "./dynamodb-config.json";
import { app } from "../../app/creation/app";
import { appDependencies } from "../../handlerCreate";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { validateAddDailyImageCommand } from "../../app/creation/validateAddDailyImageCommand";
import uuidv4 from "uuid/v4";
import AWS from "aws-sdk";
import { DynamoDbFixture } from "../DynamoDbFixture";
import { IAddDailyImageCommand } from "draw-by-days-models/lib";
import { DateIncrementer, SaveDynamoDbDailyImages } from "../../app/creation/storage/SaveDynamoDbDailyImage";
import lambdaTester = require("lambda-tester");
import laconia = require("@laconia/core");

const sqs = require("@laconia/adapter").sqs();

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

describe("Test creating daily image", () => {
  const dailyImageTableName = (<any>config).dailyImageTableName;
  const dateTableName = (<any>config).dateTableName;
  const dbEndpoint = (<any>config).localDynamoDbEndpoint;

  let dynamoDbFixture: DynamoDbFixture;
  let handler: (event: any, context: any, callback: any) => any;

  beforeAll(async () => {
    dynamoDbFixture = DynamoDbFixture.createLocalClient(dbEndpoint);
    await dynamoDbFixture.waitForDynamoDb();
  });

  beforeEach(async () => {
    handler = createHandler(dynamoDbFixture.client, dailyImageTableName, dateTableName, appDependencies);
    await dynamoDbFixture.purgeTable(dailyImageTableName);
    await dynamoDbFixture.purgeTable(dateTableName);
  });

  test("Single Daily Image saved with today's date and returned with 200 status", async () => {
    const id = uuidv4();

    const sqsEvent: SQSEvent = {
      Records: [
        createSqsRecord({
          id,
          url: "http://www.google.com/",
          date: "-REMOVE ME-",
        } as IAddDailyImageCommand),
      ],
    };

    return lambdaTester(handler)
      .event(sqsEvent)
      .expectResult(async () => {
        const response = await dynamoDbFixture.client.scan({ TableName: dailyImageTableName }).promise();

        expect(response).toMatchObject({
          Items: expect.arrayContaining([
            {
              Id: {
                S: id,
              },
              Date: {
                S: extractDateOnly(new Date()),
              },
              Url: {
                S: "http://www.google.com/",
              },
            },
          ]),
        });
      });
  });

  test("Multiple Daily Image saved with incrementing date and returned with 200 status", async () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const id1 = uuidv4();
    const id2 = uuidv4();

    const sqsEvent: SQSEvent = {
      Records: [
        createSqsRecord({
          id: id1,
          url: "http://drawbydays.test/image1.png",
          date: "-REMOVE ME-",
        } as IAddDailyImageCommand),
        createSqsRecord({
          id: id2,
          url: "http://drawbydays.test/image2.png",
          date: "-REMOVE ME-",
        } as IAddDailyImageCommand),
      ],
    };

    return lambdaTester(handler)
      .event(sqsEvent)
      .expectResult(async () => {
        const response = await dynamoDbFixture.client.scan({ TableName: dailyImageTableName }).promise();

        expect(response).toMatchObject({
          Items: expect.arrayContaining([
            {
              Id: {
                S: id1,
              },
              Date: {
                S: extractDateOnly(today),
              },
              Url: {
                S: "http://drawbydays.test/image1.png",
              },
            },
            {
              Id: {
                S: id2,
              },
              Date: {
                S: extractDateOnly(tomorrow),
              },
              Url: {
                S: "http://drawbydays.test/image2.png",
              },
            },
          ]),
        });
      });
  });

  test("Save only first item when duplicate dates provided as IDs", async () => {
    const today = new Date();

    const dependencies = () => {
      const mockDailyImageDate: DateIncrementer = {
        getDate(): Promise<Date> {
          return Promise.resolve(today);
        },
        increaseDate(): Promise<void> {
          return Promise.resolve();
        },
      };

      return {
        saveDailyImages: new SaveDynamoDbDailyImages(dynamoDbFixture.client, mockDailyImageDate, dailyImageTableName),
      };
    };
    const overwritingHandler = createHandler(dynamoDbFixture.client, dailyImageTableName, dateTableName, dependencies);

    const id1 = uuidv4();
    const id2 = uuidv4();

    const sqsEvent: SQSEvent = {
      Records: [
        createSqsRecord({
          id: id1,
          url: "http://drawbydays.test/image1.png",
          date: "-REMOVE ME-",
        } as IAddDailyImageCommand),
        createSqsRecord({
          id: id2,
          url: "http://drawbydays.test/image2.png",
          date: "-REMOVE ME-",
        } as IAddDailyImageCommand),
      ],
    };

    return lambdaTester(overwritingHandler)
      .event(sqsEvent)
      .expectResult(async () => {
        const response = await dynamoDbFixture.client.scan({ TableName: dailyImageTableName }).promise();

        expect(response).toMatchObject({
          Items: expect.arrayContaining([
            {
              Id: {
                S: id1,
              },
              Date: {
                S: extractDateOnly(today),
              },
              Url: {
                S: "http://drawbydays.test/image1.png",
              },
            },
          ]),
        });
      });
  });

  const createHandler = (
    dynamoDb: AWS.DynamoDB,
    dailyImageTableName: string,
    dateTableName: string,
    appDependencies: any,
  ) =>
    laconia(sqs(validateAddDailyImageCommand(app)))
      .register(() => ({
        env: {
          DAILY_IMAGE_TABLE_NAME: dailyImageTableName,
          DATE_TABLE_NAME: dateTableName,
        },
      }))
      .register(() => ({ dynamoDb }))
      .register(appDependencies);

  const createSqsRecord = (body: object): SQSRecord => ({
    attributes: {
      ApproximateFirstReceiveTimestamp: "",
      ApproximateReceiveCount: "",
      SenderId: "",
      SentTimestamp: "",
    },
    awsRegion: "",
    eventSource: "",
    eventSourceARN: "",
    md5OfBody: "",
    messageAttributes: {},
    messageId: "",
    receiptHandle: "",
    body: JSON.stringify(body),
  });

  const extractDateOnly = (date: Date) => date.toISOString().split("T")[0];
});
