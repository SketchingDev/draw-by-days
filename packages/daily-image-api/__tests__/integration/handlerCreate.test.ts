import * as config from "./dynamodb-config.json";
import { app } from "../../app/creation/app";
import { appDependencies } from "../../handlerCreate";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { validateAddDailyImageCommand } from "../../app/creation/validateAddDailyImageCommand";
import uuidv4 from "uuid/v4";
import AWS from "aws-sdk";
import { DynamoDbFixture } from "../DynamoDbFixture";
import lambdaTester = require("lambda-tester");
import laconia = require("@laconia/core");
import { IAddDailyImageCommand } from "draw-by-days-models/lib";

const sqs = require("@laconia/adapter").sqs();

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

describe("Test creating daily image", () => {
  const tableName = (<any>config).tableName;
  const dbEndpoint = (<any>config).localDynamoDbEndpoint;

  let dynamoDbFixture: DynamoDbFixture;
  let handler: (event: any, context: any, callback: any) => any;

  beforeAll(async () => {
    dynamoDbFixture = DynamoDbFixture.createLocalClient(dbEndpoint);
    await dynamoDbFixture.waitForDynamoDb();
  });

  beforeEach(() => {
    handler = createHandler(dynamoDbFixture.client, tableName);
  });

  afterEach(async () => {
    await dynamoDbFixture.purgeTable(tableName);
  });

  test("Daily Image returned with 200 status", async () => {
    const id = uuidv4();

    const sqsEvent: SQSEvent = {
      Records: [
        createSqsRecord({
          id,
          url: "http://www.google.com/",
          date: "2019-01-20",
        } as IAddDailyImageCommand),
      ],
    };

    return lambdaTester(handler)
      .event(sqsEvent)
      .expectResult(async () => {
        const response = await dynamoDbFixture.client.scan({ TableName: tableName }).promise();

        expect(response).toMatchObject({
          Items: expect.arrayContaining([
            {
              id: {
                S: id,
              },
              date: {
                S: "2019-01-20",
              },
              url: {
                S: "http://www.google.com/",
              },
            },
          ]),
        });
      });
  });

  test("Daily Images returned with 200 status", async () => {
    const id1 = uuidv4();
    const id2 = uuidv4();

    const sqsEvent: SQSEvent = {
      Records: [
        createSqsRecord({
          id: id1,
          url: "http://drawbydays.test/image1.png",
          date: "2019-01-20",
        } as IAddDailyImageCommand),
        createSqsRecord({
          id: id2,
          url: "http://drawbydays.test/image2.png",
          date: "2019-01-16",
        } as IAddDailyImageCommand),
      ],
    };

    return lambdaTester(handler)
      .event(sqsEvent)
      .expectResult(async () => {
        const response = await dynamoDbFixture.client.scan({ TableName: tableName }).promise();

        expect(response).toMatchObject({
          Items: expect.arrayContaining([
            {
              id: {
                S: id1,
              },
              date: {
                S: "2019-01-20",
              },
              url: {
                S: "http://drawbydays.test/image1.png",
              },
            },
            {
              id: {
                S: id2,
              },
              date: {
                S: "2019-01-16",
              },
              url: {
                S: "http://drawbydays.test/image2.png",
              },
            },
          ]),
        });
      });
  });

  const createHandler = (dynamoDb: AWS.DynamoDB, tableName: string) =>
    laconia(sqs(validateAddDailyImageCommand(app)))
      .register(() => ({
        env: {
          TABLE_NAME: tableName,
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
});
