import CloudFormation from "aws-sdk/clients/cloudformation";
import { extractServiceOutputs, ServiceDeployment } from "../helpers/extractServiceOutputs";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { URL } from "url";
import { DynamoDbTweetsRepo } from "../../src/tweets/DynamoDbTweetsRepo";
import { fail } from "assert";
import { ImageInfoRepository } from "../helpers/ImageInfoRepository";

jest.setTimeout(60 * 1000);

describe("DynamoDB Tweets Repo", () => {
  const region = "us-east-1";
  const stackName = "scheduled-tweeter-dev";

  let stackOutputs: ServiceDeployment;
  let dynamoDb: DynamoDB;
  let imageInfoRepo: ImageInfoRepository;

  beforeAll(async () => {
    stackOutputs = await extractServiceOutputs(stackName, new CloudFormation({ region, apiVersion: "2010-05-15" }));
    dynamoDb = new DynamoDB({ region: "us-east-1" });

    imageInfoRepo = new ImageInfoRepository(dynamoDb, stackOutputs.imageInfoTable!);
  });

  test("untweeted image is returned", async () => {
    await imageInfoRepo.populateDatabaseWithItem();

    const dynamoDbImageInfo = new DynamoDbTweetsRepo(dynamoDb, stackOutputs.imageInfoTable!);
    expect(await dynamoDbImageInfo.getImageToTweet())
      .toStrictEqual({
        "content": {
          "media": {
            "s3Key": expect.any(String),
            "sourceUrl": expect.any(URL)
          },
          "text": expect.any(String)
        },
        "id": expect.any(String)
      });
  });

  test("item is marked as tweeted", async () => {
    await imageInfoRepo.populateDatabaseWithItem();

    const dynamoDbImageInfo = new DynamoDbTweetsRepo(dynamoDb, stackOutputs.imageInfoTable!);
    const imageToTweet = await dynamoDbImageInfo.getImageToTweet();

    if (!imageToTweet) {
      fail("Image to tweet undefined");
    }

    const tweetId = uuidv4();
    await dynamoDbImageInfo.markImageAsTweeted(imageToTweet, tweetId);

    expect(await imageInfoRepo.findItemById(imageToTweet.id))
      .toStrictEqual({
        Content: {
          M: {
            Media: {
              M: {
                S3Key: {
                  S: imageToTweet?.content.media.s3Key
                },
                SourceUrl: {
                  S: imageToTweet?.content.media.sourceUrl.toString()
                }
              }
            },
            Text: {
              S: imageToTweet?.content.text
            }
          }
        },
        Id: {
          S: imageToTweet?.id
        },
        TweetId: {
          S: tweetId
        }
      });
  });
});
