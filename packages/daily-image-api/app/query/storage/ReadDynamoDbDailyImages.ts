import AWS from "aws-sdk";
import { AttributeMap } from "aws-sdk/clients/dynamodb";
import { ReadDailyImages } from "./ReadDailyImages";
import { URL } from "url";
import { DailyImage } from "../../domain/DailyImage";

export class ReadDynamoDbDailyImages implements ReadDailyImages {
  private static readonly timeDelimiter = "T";

  private static convertToIsoDate(date: Date) {
    return date.toISOString().split(ReadDynamoDbDailyImages.timeDelimiter)[0];
  }

  private static convertToDailyImage(item: AttributeMap): DailyImage {
    return {
      id: item.Id.S!,
      url: new URL(item.Url.S!),
      date: new Date(item.Date.S!),
    };
  }

  public constructor(private dynamoDb: AWS.DynamoDB, private tableName: string) {}

  async getByDate(date: Date): Promise<DailyImage[]> {
    const params = {
      ExpressionAttributeNames: {
        "#Date": "Date",
      },
      ExpressionAttributeValues: {
        ":Date": {
          S: ReadDynamoDbDailyImages.convertToIsoDate(date),
        },
      },
      FilterExpression: "#Date = :Date",
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
