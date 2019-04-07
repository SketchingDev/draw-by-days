import { saveRemoteFileToS3, saveRemoteFileToS3Factory } from "../app/storage/saveImageToBucket";
import { URL } from "url";
import AWS from "aws-sdk";
import laconia from "@laconia/core";
import { ingestImage } from "../app/ingestImage";
import lambdaTester = require("lambda-tester");
import nock = require("nock");

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

jest.setTimeout(30 * 1000);

describe("Handler", () => {
  beforeAll(() => {
    AWS.config.update({
      region: "us-west-1",
      sslEnabled: true,
      logger: console,
      accessKeyId: "ACCESSKEYID",
      secretAccessKey: "SECRETACCESSKEY",
    });
  });

  const bucketName = "test-bucket-name";
  let s3: AWS.S3;

  beforeEach(() => {
    s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  });

  test("Puts body of remote request as S3 object", async () => {
    const getRandomImage = jest.fn().mockResolvedValue({ url: new URL("http://drawbydays.com/test-image.png") });

    const remoteImageScope = nock("http://drawbydays.com")
      .get("/test-image.png")
      .reply(200, "test-body");

    const s3PutScope = nock(`https://${bucketName}.s3.amazonaws.com`)
      .put("/drawbydays.com%21test-image.png", "test-body")
      .reply(200);

    const remoteUrlS3Saver: saveRemoteFileToS3 = saveRemoteFileToS3Factory(s3, bucketName);

    const devDependencies = () => ({
      getRandomImage: getRandomImage,
      remoteUrlS3Saver,
    });

    return lambdaTester(laconia(ingestImage).register(devDependencies))
      .event({})
      .expectResult(async () => {
        expect(s3PutScope.isDone()).toBe(true);
        expect(remoteImageScope.isDone()).toBe(true);
      });
  });
});
