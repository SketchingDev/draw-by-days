import * as serverlessOutput from "../../.serverless/outputs.json";
import AWS from "aws-sdk";
import { S3Fixture } from "../fixtures/S3Fixture";

jest.setTimeout(20 * 1000);

describe("Test deployed image ingest service", () => {
  let bucketName: string;
  let functionArn: string;

  let lambda: AWS.Lambda;
  let s3Fixture: S3Fixture;

  beforeAll(() => {
    lambda = new AWS.Lambda({ region: "us-east-1" });
    s3Fixture = new S3Fixture(new AWS.S3());

    bucketName = (<any>serverlessOutput).ImagesBucketName;
    functionArn = (<any>serverlessOutput).PixabayImageIngesterLambdaFunctionQualifiedArn;
  });

  beforeEach(async () => {
    await s3Fixture.createBucket(bucketName);
  });

  afterEach(async () => {
    await s3Fixture.deleteBucket(bucketName);
  });

  test("Image from Pixabay is saved to a bucket", async () => {
    const { Payload } = await lambda
      .invoke({
        FunctionName: functionArn,
      })
      .promise();

    const { objectKey } = JSON.parse(<string>Payload);
    expect(await s3Fixture.waitForObject(bucketName, objectKey)).toBeDefined();
  });
});
