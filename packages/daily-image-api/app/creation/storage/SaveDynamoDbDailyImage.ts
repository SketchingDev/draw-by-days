import AWS, { DynamoDB } from "aws-sdk";
import { DailyImage } from "../../DailyImage";
import { SaveDailyImages } from "./SaveDailyImages";
import { AttributeMap } from "aws-sdk/clients/dynamodb";

// TODO Investigate how to perform these operations when applying CQRS
// Is a query an event (image added?)
export class SaveDynamoDbDailyImages implements SaveDailyImages {
  private static readonly timeDelimiter = "T";

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
