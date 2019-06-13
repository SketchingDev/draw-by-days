import AWS from "aws-sdk";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { ReadDailyImages } from "./ReadDailyImages";
import { DailyImage } from "draw-by-days-models/lib";
import { URL } from "url";

export class ReadDynamoDbDailyImages implements ReadDailyImages {
  private static readonly timeDelimiter = "T";

  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(ReadDynamoDbDailyImages.timeDelimiter)[0];
  }

  private static convertToDailyImage(item: AttributeMap): DailyImage {
    return {
      id: item.id.S!,
      url: new URL(item.url.S!),
      date: new Date(item.date.S!),
    };
  }

  public constructor(private dynamoDb: AWS.DynamoDB, private tableName: string) {}

  async getByDate(date: Date): Promise<DailyImage[]> {
    const params = {
      ExpressionAttributeNames: {
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":date": {
          S: ReadDynamoDbDailyImages.convertToIsoDate(date),
        },
      },
      FilterExpression: "#date = :date",
      TableName: this.tableName,
    };

    const response = await this.dynamoDb.scan(params).promise();
    if (response && response.Items) {
      return response.Items.map(ReadDynamoDbDailyImages.convertToDailyImage);
    } else {
      return [];
    }
  }
}
