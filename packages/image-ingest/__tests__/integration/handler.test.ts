import * as config from "./s3-config.json";
import AWS from "aws-sdk";
import laconia from "@laconia/core";
import { ingestImage } from "../../app/ingestImage";
import { pixabayIngesterDependencies } from "../../handler";
import { startNockPixabayServer } from "../fixtures/pixabay";
import * as nock from "nock";
import { S3Fixture } from "../fixtures/S3Fixture";
import lambdaTester = require("lambda-tester");

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

jest.setTimeout(30 * 1000);

describe("Handler", () => {
  const tenSecondTimeout = 10;
  const s3Endpoint = (<any>config).localS3Endpoint;

  let s3Fixture: S3Fixture;
  let handler: (event: any, context: any, callback: any) => any;
  let bucketName: string;

  beforeAll(async () => {
    s3Fixture = S3Fixture.createLocalClient(s3Endpoint);
    await s3Fixture.waitForS3(tenSecondTimeout);
  });

  beforeEach(async () => {
    bucketName = await s3Fixture.createRandomBucket();
    handler = createHandler(s3Fixture.client, bucketName);
  });

  afterEach(async () => {
    nock.cleanAll();
    await s3Fixture.deleteBucket(bucketName);
  });

  test("Saves remote image to S3", async () => {
    startNockPixabayServer("test_image.png", "Body of image");

    return lambdaTester(handler)
      .event({})
      .expectResult(async () => {
        const expectedObjectKey = "pixabay.com!test_image.png";
        const expectedObjectBody = "Body of image";

        const object = s3Fixture.waitForObject(bucketName, expectedObjectKey);
        expect(object).resolves.toMatchObject({ ContentLength: expectedObjectBody.length });
      });
  });

  const createHandler = (s3: AWS.S3, bucketName: string) =>
    laconia(ingestImage)
      .register(() => ({
        env: {
          PIXABAY_API_KEY: "test-api-key",
          IMAGE_STORAGE_BUCKET_NAME: bucketName,
        },
      }))
      .register(() => ({ s3 }))
      .register(pixabayIngesterDependencies);
});
