import AWS, { DynamoDB } from "aws-sdk";
import { SaveDailyImages } from "./SaveDailyImages";
import { AttributeMap, WriteRequests } from "aws-sdk/clients/dynamodb";
import { DailyImage } from "../../domain/DailyImage";
import { DateIncrementer } from "./DateIncrementer";

export class SaveDynamoDbDailyImages implements SaveDailyImages {
  private static readonly timeDelimiter = "T";

  /**
   * Creates a valid extended ISO 8601 Date string. In other words, date strings of the
   * form YYYY-MM-DD.
   */
  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(SaveDynamoDbDailyImages.timeDelimiter)[0];
  }

  public constructor(
    private dynamoDb: AWS.DynamoDB,
    private dateIncrementer: DateIncrementer,
    private dailyImagesTableName: string,
  ) {}

  private static convertToAttributeMap(date: Date, { id, url }: DailyImage): AttributeMap {
    return {
      Id: {
        S: id,
      },
      Url: {
        S: url.toString(),
      },
      Date: {
        S: SaveDynamoDbDailyImages.convertToIsoDate(date),
      },
    };
  }

  public async saveAll(dailyImages: DailyImage[]): Promise<void> {
    const tablePutItems: WriteRequests = [];

    for (const image of dailyImages) {
      let date = await this.dateIncrementer.getDate();

      tablePutItems.push({
        PutRequest: { Item: SaveDynamoDbDailyImages.convertToAttributeMap(date, image) },
      });

      await this.dateIncrementer.increaseDate(date);
    }

    const params: DynamoDB.Types.BatchWriteItemInput = { RequestItems: {} };
    params.RequestItems[this.dailyImagesTableName] = tablePutItems;

    await this.dynamoDb.batchWriteItem(params).promise();
  }
}
