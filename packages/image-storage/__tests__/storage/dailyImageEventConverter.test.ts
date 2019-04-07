import { S3CreateEvent, S3EventRecord } from "aws-lambda";
import { DailyImageEventConverter } from "../../storage/dailyImageEventConverter";

describe("Transform S3 ObjectCreated event to DailyImage model", () => {
  const createS3CreateRecord = (objectKey: string): S3EventRecord => ({
    awsRegion: "",
    eventName: "",
    eventSource: "",
    eventTime: "",
    eventVersion: "",
    requestParameters: { sourceIPAddress: "" },
    responseElements: {
      "x-amz-request-id": "",
      "x-amz-id-2": "",
    },
    s3: {
      bucket: { arn: "", name: "", ownerIdentity: { principalId: "" } },
      configurationId: "",
      object: { eTag: "", key: objectKey, sequencer: "", size: 0, versionId: "" },
      s3SchemaVersion: "",
    },
    userIdentity: { principalId: "" },
  });

  test("Transforms single S3 Create event to a Daily Image model", () => {
    const eventTransformer = new DailyImageEventConverter(
      () => new Date("2019-02-01T00:00:00.000Z"),
      "http://drawbydays1.test/123/",
    );

    const s3CreateEvent: S3CreateEvent = {
      Records: [createS3CreateRecord("test-object-key")],
    };

    const transformedEvents = eventTransformer.convert(s3CreateEvent);
    expect(transformedEvents).toMatchObject([
      {
        date: "2019-02-01",
        url: "http://drawbydays1.test/123/test-object-key",
      },
    ]);
  });

  test("Transforms multiple S3 Create events to Daily Image models", () => {
    const eventTransformer = new DailyImageEventConverter(
      () => new Date("2019-02-02T00:00:00.000Z"),
      "http://drawbydays2.test/",
    );

    const s3CreateEvent: S3CreateEvent = {
      Records: [createS3CreateRecord("test-object-key1"), createS3CreateRecord("test-object-key2")],
    };

    const transformedEvents = eventTransformer.convert(s3CreateEvent);
    expect(transformedEvents).toMatchObject([
      { date: "2019-02-02", url: "http://drawbydays2.test/test-object-key1" },
      { date: "2019-02-02", url: "http://drawbydays2.test/test-object-key2" },
    ]);
  });
});
