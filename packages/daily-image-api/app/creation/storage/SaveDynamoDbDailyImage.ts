import AWS, { DynamoDB } from "aws-sdk";
import { DailyImage } from "draw-by-days-models/lib";
import { SaveDailyImages } from "./SaveDailyImages";
import { AttributeMap } from "aws-sdk/clients/dynamodb";

export class SaveDynamoDbDailyImages implements SaveDailyImages {
  private static readonly timeDelimiter = "T";

  /**
   * Creates a valid extended ISO 8601 Date string. In other words, date strings of the
   * form YYYY-MM-DD.
   */
  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(SaveDynamoDbDailyImages.timeDelimiter)[0];
  }

  public constructor(private dynamoDb: AWS.DynamoDB, private tableName: string) {}

  private static convertToAttributeMap({ id, url, date }: DailyImage): AttributeMap {
    return {
      id: {
        S: id,
      },
      url: {
        S: url.toString(),
      },
      date: {
        S: SaveDynamoDbDailyImages.convertToIsoDate(date),
      },
    };
  }

  async saveAll(dailyImages: DailyImage[]): Promise<void> {
    const params: DynamoDB.Types.BatchWriteItemInput = { RequestItems: {} };

    params.RequestItems[this.tableName] = dailyImages.map(image => ({
      PutRequest: { Item: SaveDynamoDbDailyImages.convertToAttributeMap(image) },
    }));

    await this.dynamoDb.batchWriteItem(params).promise();
  }
}
