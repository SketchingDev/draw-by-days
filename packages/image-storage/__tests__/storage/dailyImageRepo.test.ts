import AWSAppSyncClient from "aws-appsync/lib";
import { AppSyncDailyImageRepo, DailyImageRepository } from "../../storage/dailyImageRepo";

describe("Save DailyImage to AppSync API", () => {
  const AppSyncClientMock = jest.fn<AWSAppSyncClient<any>>(() => ({
    mutate: jest.fn().mockImplementation(() => ({ data: {} })),
  }));

  let mockAppSyncRepo: AWSAppSyncClient<any>;
  let appSyncDailyImageRepo: DailyImageRepository;

  beforeEach(() => {
    mockAppSyncRepo = new AppSyncClientMock();
    appSyncDailyImageRepo = new AppSyncDailyImageRepo(mockAppSyncRepo);
  });

  test("AppSync mutate called with date and URL from model", async () => {
    await appSyncDailyImageRepo.saveAll([{ date: "10-10-2019", url: "http://drawbydays.test/" }]);

    expect(mockAppSyncRepo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: "no-cache",
        variables: { date: "10-10-2019", url: "http://drawbydays.test/" },
      }),
    );
  });

  test("AppSync mutate called with model but ignores the ID property", async () => {
    await appSyncDailyImageRepo.saveAll([{ id: "test-id", date: "10-10-2019", url: "http://drawbydays.test/" }]);

    expect(mockAppSyncRepo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        fetchPolicy: "no-cache",
        variables: { date: "10-10-2019", url: "http://drawbydays.test/" },
      }),
    );
  });
});
