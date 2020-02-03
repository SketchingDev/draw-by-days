import { v4 as uuidv4 } from "uuid";
import { DynamoDB } from "aws-sdk";

export class ImageInfoRepository {
  constructor(private dynamoDb: DynamoDB, private imageInfoTable: string) {}

  /**
   * Scans for an item in the most up-to-date data by using strongly consistent reads
   * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html
   */
  public async findItemById(id: string) {
    const scanResult = await this.dynamoDb.scan({
      ExpressionAttributeValues: {
        ":id": { S: id }
      },
      FilterExpression: "Id = :id",
      TableName: this.imageInfoTable,
      ConsistentRead: true
    }).promise();

    return scanResult.Items?.pop();
  };

  public async populateDatabaseWithItem(s3Key: string = "s3-test-key", tweetText: string = uuidv4()) {
    const id = uuidv4();
    await this.dynamoDb.putItem({
      Item: {
        Id: { S: id },
        Content: {
          M: {
            Text: { S: tweetText },
            Media: {
              M: {
                SourceUrl: { S: "http://test.test/" },
                S3Key: { S: s3Key }
              }
            }
          }
        }
      },
      TableName: this.imageInfoTable
    }).promise();

    // Wait for item to be added
    return await this.findItemById(id);
  };
}
