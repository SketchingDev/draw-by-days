import AWS from "aws-sdk";
import { ReadDynamoDbDailyImages } from "../../../../../app/query/storage/ReadDynamoDbDailyImages";

jest.mock("aws-sdk");

describe("ReadDynamoDbDailyImages", () => {
  describe("getByDate", () => {
    test("If scanning Dynamo DB fails, empty array is returned", async () => {
      const dbMock = new AWS.DynamoDB();
      dbMock.scan = jest.fn(() => ({
        promise: jest.fn().mockResolvedValue(null)
      }));

      const sut = new ReadDynamoDbDailyImages(dbMock, "tableName");

      var result = await sut.getByDate(new Date());

      expect(result).toEqual([]);
    });

    test("If scanning Dynamo DB returns null items key in response, empty array is returned", async () => {
      const dbMock = new AWS.DynamoDB();
      dbMock.scan = jest.fn(() => ({
        promise: jest.fn().mockResolvedValue({ Items: null })
      }));

      const sut = new ReadDynamoDbDailyImages(dbMock, "tableName");

      var result = await sut.getByDate(new Date());

      expect(result).toEqual([]);
    });
  });
});
