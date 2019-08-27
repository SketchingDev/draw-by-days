import * as config from "./dynamodb-config.json";
import lambdaTester = require("lambda-tester");
import laconia = require("@laconia/core");
import { APIGatewayProxyResult } from "aws-lambda";
import { apiGatewayAdapter } from "../../app/query/http/apiGatewayAdapter";
import { app } from "../../app/query/app";
import { appDependencies } from "../../handlerGet";
import AWS from "aws-sdk";
import uuidv4 from "uuid/v4";
import { DynamoDbFixture } from "../DynamoDbFixture";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

describe("Test querying daily image", () => {
  const dailyImageTableName: string = (<any>config).dailyImageTableName;
  const dbEndpoint: string = (<any>config).localDynamoDbEndpoint;

  const todaysDate = new Date().toISOString().split("T")[0];
  const tomorrowsDate = new Date(new Date().setHours(24)).toISOString().split("T")[0];

  let dynamoDbFixture: DynamoDbFixture;

  beforeAll(async () => {
    dynamoDbFixture = DynamoDbFixture.createLocalClient(dbEndpoint);
    await dynamoDbFixture.waitForDynamoDb();
  });

  afterEach(async () => {
    await dynamoDbFixture.purgeTable(dailyImageTableName);
  });

  test("Daily Image for valid date returns 200 status", async () => {
    const id = uuidv4();
    await dynamoDbFixture.insertTestData(dailyImageTableName, {
      Id: {
        S: id,
      },
      Url: {
        S: "http://drawbydays.test/image1.png",
      },
      Date: {
        S: todaysDate,
      },
    });
    await dynamoDbFixture.insertTestData(dailyImageTableName, {
      Id: {
        S: uuidv4(),
      },
      Url: {
        S: "http://drawbydays.test/image2.png",
      },
      Date: {
        S: tomorrowsDate,
      },
    });

    const handler = createHandler(dynamoDbFixture.client, dailyImageTableName);

    return lambdaTester(handler)
      .event({
        pathParameters: { date: todaysDate },
      })
      .expectResult(async (result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          statusCode: 200,
        });
        expect(JSON.parse(result.body)).toEqual(
          expect.arrayContaining([
            {
              id,
              url: "http://drawbydays.test/image1.png",
              date: new Date(todaysDate).toISOString(),
            },
          ]),
        );
      });
  });

  test("Generic error message returned with 500 status", async () => {
    const misconfiguredHandler = createHandler(dynamoDbFixture.client, "non-existent-images-table");

    return lambdaTester(misconfiguredHandler)
      .event({ pathParameters: { date: todaysDate } })
      .expectResult(async (result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          statusCode: 500,
          body: JSON.stringify({ error: { message: "Unknown error" } }),
        });
      });
  });

  test("Invalid date returns 500 status", async () => {
    const misconfiguredHandler = createHandler(dynamoDbFixture.client, "non-existent-images-table");

    return lambdaTester(misconfiguredHandler)
      .event({ pathParameters: { date: "invalid-date" } })
      .expectResult(async (result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          statusCode: 500,
          body: JSON.stringify({ error: { message: "Invalid date" } }),
        });
      });
  });

  const createHandler = (dynamoDb: AWS.DynamoDB, tableName: string) =>
    laconia(apiGatewayAdapter(app))
      .register(() => ({
        env: {
          DAILY_IMAGE_TABLE_NAME: tableName,
        },
      }))
      .register(() => ({ dynamoDb }))
      .register(appDependencies);
});
