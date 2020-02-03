import { DynamoDB } from "aws-sdk";
import { URL } from "url";

export interface ImageTweet {
  id: string;
  content: {
    text: string;
    media: {
      sourceUrl: URL;
      s3Key: string;
    }
  }
}

export interface TweetsRepo {
  getImageToTweet(): Promise<ImageTweet | undefined>;

  markImageAsTweeted(tweet: { id: string }, tweetId: string): Promise<void>;
}

export class DynamoDbTweetsRepo implements TweetsRepo {
  private static convertToScheduledTweet(item: DynamoDB.AttributeMap): ImageTweet {
    return {
      id: item.Id.S!,
      content: {
        text: item.Content.M!.Text.S!,
        media: {
          sourceUrl: new URL(item.Content.M!.Media.M!.SourceUrl.S!),
          s3Key: item.Content.M!.Media.M!.S3Key.S!
        }
      }
    };
  }

  public constructor(
    private readonly dynamoDb: AWS.DynamoDB,
    private readonly tableName: string) {
  }

  public async getImageToTweet(): Promise<ImageTweet | undefined> {
    const params: DynamoDB.ScanInput = {
      FilterExpression: "attribute_not_exists(TweetId)",
      TableName: this.tableName
    };

    const response = await this.dynamoDb.scan(params).promise();

    return response?.Items?.map(DynamoDbTweetsRepo.convertToScheduledTweet).pop();
  }

  public async markImageAsTweeted(tweet: { id: string }, tweetId: string): Promise<void> {
    const params: DynamoDB.UpdateItemInput = {
      ExpressionAttributeNames: {
        "#TweetId": "TweetId"
      },
      ExpressionAttributeValues: {
        ":TweetId": {
          S: tweetId
        }
      },
      Key: {
        "Id": {
          S: tweet.id
        }
      },
      TableName: this.tableName,
      UpdateExpression: "SET #TweetId = :TweetId"
    };

    await this.dynamoDb.updateItem(params).promise();
  }
}
