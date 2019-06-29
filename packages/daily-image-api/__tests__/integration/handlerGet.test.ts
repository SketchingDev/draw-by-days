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
  const tableName: string = (<any>config).tableName;
  const dbEndpoint: string = (<any>config).localDynamoDbEndpoint;

  const todaysDate = new Date().toISOString().split("T")[0];

  let dynamoDbFixture: DynamoDbFixture;

  beforeAll(async () => {
    dynamoDbFixture = DynamoDbFixture.createLocalClient(dbEndpoint);
    await dynamoDbFixture.waitForDynamoDb();
  });

  afterEach(async () => {
    await dynamoDbFixture.purgeTable(tableName);
  });

  test("Daily Image returned with 200 status", async () => {
    const id = uuidv4();
    await dynamoDbFixture.insertTestData(tableName, {
      id: {
        S: id,
      },
      url: {
        S: "http://drawbydays.test/image.png",
      },
      date: {
        S: todaysDate,
      },
    });

    const handler = createHandler(dynamoDbFixture.client, tableName);

    return lambdaTester(handler)
      .event({})
      .expectResult(async (result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          statusCode: 200,
        });
        expect(JSON.parse(result.body)).toEqual(
          expect.arrayContaining([
            {
              id,
              url: "http://drawbydays.test/image.png",
              date: new Date(todaysDate).toISOString(),
            },
          ]),
        );
      });
  });

  test("Generic error message returned with 500 status", async () => {
    const misconfiguredHandler = createHandler(dynamoDbFixture.client, "non-existent-images-table");

    return lambdaTester(misconfiguredHandler)
      .event({})
      .expectResult(async (result: APIGatewayProxyResult) => {
        expect(result).toMatchObject({
          statusCode: 500,
          body: "Unknown error",
        });
      });
  });

  const createHandler = (dynamoDb: AWS.DynamoDB, tableName: string) =>
    laconia(apiGatewayAdapter(app))
      .register(() => ({
        env: {
          TABLE_NAME: tableName,
        },
      }))
      .register(() => ({ dynamoDb }))
      .register(appDependencies);
});
