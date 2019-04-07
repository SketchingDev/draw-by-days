import { adapter, app, AppDependencies } from "../handler";
import { S3CreateEvent } from "aws-lambda";
import AWSAppSyncClient from "aws-appsync/lib";
import { AppSyncDailyImageRepo } from "../storage/dailyImageRepo";
import { DailyImageEventConverter } from "../storage/dailyImageEventConverter";

describe("Handler tests", () => {
  const AppSyncClientMock = jest.fn<AWSAppSyncClient<any>>(() => ({
    mutate: jest.fn().mockImplementation(() => ({ data: {} })),
  }));

  let mockAppSyncClient: AWSAppSyncClient<any>;
  let appDependencies: AppDependencies;

  beforeEach(() => {
    mockAppSyncClient = new AppSyncClientMock();

    appDependencies = {
      dailyImageRepo: new AppSyncDailyImageRepo(mockAppSyncClient),
      eventConverter: new DailyImageEventConverter(
        () => new Date("2019-01-13T00:00:00.000Z"),
        "http://drawbydays.test/bucket/",
      ),
    };
  });

  test("Handler parses S3 creation events and saved resulting daily images to AppSync", async () => {
    const sourceEvents: S3CreateEvent = {
      Records: [
        {
          s3: {
            object: { key: "test-object-key1" },
          },
        } as any,
        {
          s3: {
            object: { key: "test-object-key2" },
          },
        } as any,
      ],
    };

    await adapter(app)(sourceEvents, appDependencies);

    expect(mockAppSyncClient.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: "no-cache",
        variables: { date: "2019-01-13", url: `http://drawbydays.test/bucket/test-object-key1` },
      }),
    );
    expect(mockAppSyncClient.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: "no-cache",
        variables: { date: "2019-01-13", url: "http://drawbydays.test/bucket/test-object-key2" },
      }),
    );
  });
});
