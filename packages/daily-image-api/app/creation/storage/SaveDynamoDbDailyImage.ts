import AWS, { DynamoDB } from "aws-sdk";
import { DailyImage } from "draw-by-days-models/lib";
import { SaveDailyImages } from "./SaveDailyImages";
import { AttributeMap, WriteRequests } from "aws-sdk/clients/dynamodb";

export interface DateIncrementer {
  getDate(defaultDate?: Date): Promise<Date>;
  increaseDate(date: Date): Promise<void>;
}

export class DynamoDbDailyImageDate implements DateIncrementer {
  private static readonly timeDelimiter = "T";
  private static readonly RowId = 0;

  /**
   * Creates a valid extended ISO 8601 Date string. In other words, date strings of the
   * form YYYY-MM-DD.
   */
  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(DynamoDbDailyImageDate.timeDelimiter)[0];
  }

  public constructor(private dynamoDb: AWS.DynamoDB, private tableName: string) {}

  public async getDate(defaultDate = new Date()): Promise<Date> {
    const params = {
      ProjectionExpression: "Id, NextDate",
      KeyConditionExpression: "Id = :index",
      ExpressionAttributeValues: {
        ":index": { S: `${DynamoDbDailyImageDate.RowId}` },
      },
      TableName: this.tableName,
    };

    const response = await this.dynamoDb.query(params).promise();

    if (response && response.Items && response.Items.length === 1) {
      const [nextDate] = response.Items;
      return new Date(nextDate.NextDate.S!);
    }

    return defaultDate;
  }

  /**
   * Increased the stored date by 1 day
   * @param previousDate Date to be increased
   */
  public async increaseDate(previousDate: Date): Promise<void> {
    const nextDay = new Date(previousDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const params = {
      TableName: this.tableName,
      Item: {
        Id: {
          S: `${DynamoDbDailyImageDate.RowId}`,
        },
        NextDate: {
          S: DynamoDbDailyImageDate.convertToIsoDate(nextDay),
        },
      },
      ConditionExpression: "NextDate = :lastKnownDate or attribute_not_exists(Id)",
      ExpressionAttributeValues: {
        ":lastKnownDate": { S: DynamoDbDailyImageDate.convertToIsoDate(previousDate) },
      },
    };

    await this.dynamoDb.putItem(params).promise();
  }
}

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
    private dailyImageDate: DateIncrementer,
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
      let date = await this.dailyImageDate.getDate();

      tablePutItems.push({
        PutRequest: { Item: SaveDynamoDbDailyImages.convertToAttributeMap(date, image) },
      });

      await this.dailyImageDate.increaseDate(date);
    }

    const params: DynamoDB.Types.BatchWriteItemInput = { RequestItems: {} };
    params.RequestItems[this.dailyImagesTableName] = tablePutItems;

    await this.dynamoDb.batchWriteItem(params).promise();
  }
}
