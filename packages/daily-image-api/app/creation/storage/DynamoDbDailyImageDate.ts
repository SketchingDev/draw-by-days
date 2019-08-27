import AWS from "aws-sdk";
import { DateIncrementer } from "./DateIncrementer";

export class DynamoDbDateIncrementer implements DateIncrementer {
  private static readonly timeDelimiter = "T";
  private static readonly RowId = 0;

  /**
   * Creates a valid extended ISO 8601 Date string. In other words, date strings of the
   * form YYYY-MM-DD.
   */
  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(DynamoDbDateIncrementer.timeDelimiter)[0];
  }

  public constructor(private dynamoDb: AWS.DynamoDB, private tableName: string) {}

  public async getDate(defaultDate = new Date()): Promise<Date> {
    const params = {
      ProjectionExpression: "Id, NextDate",
      KeyConditionExpression: "Id = :index",
      ExpressionAttributeValues: {
        ":index": { S: `${DynamoDbDateIncrementer.RowId}` },
      },
      TableName: this.tableName,
    };

    const response = await this.dynamoDb.query(params).promise();

    if (response && response.Items && response.Items.length === 1) {
      const [nextDate] = response.Items;
      return new Date(nextDate.NextDate.S!);
    }

    console.log(`No previous date stored in ${this.tableName}, returned ${defaultDate}`);
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
          S: `${DynamoDbDateIncrementer.RowId}`,
        },
        NextDate: {
          S: DynamoDbDateIncrementer.convertToIsoDate(nextDay),
        },
      },
      ConditionExpression: "NextDate = :lastKnownDate or attribute_not_exists(Id)",
      ExpressionAttributeValues: {
        ":lastKnownDate": { S: DynamoDbDateIncrementer.convertToIsoDate(previousDate) },
      },
    };

    await this.dynamoDb.putItem(params).promise();
  }
}
