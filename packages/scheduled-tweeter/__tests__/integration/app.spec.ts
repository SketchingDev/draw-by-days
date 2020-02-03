import { Context, ScheduledEvent, ScheduledHandler } from "aws-lambda";
import { DynamoDB, S3 } from "aws-sdk";
import { extractServiceOutputs, ServiceDeployment } from "../helpers/extractServiceOutputs";
import CloudFormation from "aws-sdk/clients/cloudformation";
import { app, Dependencies } from "../../src/App";
import { DynamoDbTweetsRepo } from "../../src/tweets/DynamoDbTweetsRepo";
import { ImageTweeter } from "../../src/tweets/TwitTwitter";
import { ImageInfoRepository } from "../helpers/ImageInfoRepository";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

describe("Application", () => {
  const region = "us-east-1";
  const stackName = "scheduled-tweeter-dev";
  const testFile = path.join(__dirname, "../assets/test-image.png");

  let stackOutputs: ServiceDeployment;
  let testDependencies: Dependencies;
  let imageTweeter: jest.Mocked<ImageTweeter>;
  let imageInfoRepo: ImageInfoRepository;
  let s3: S3;

  beforeAll(async () => {
    stackOutputs = await extractServiceOutputs(
      stackName,
      new CloudFormation({ region, apiVersion: "2010-05-15" })
    );

    const dynamoDb = new DynamoDB({ region });
    imageInfoRepo = new ImageInfoRepository(dynamoDb, stackOutputs.imageInfoTable!);

    s3 = new S3({ region });

    imageTweeter = { tweetImage: jest.fn() };

    testDependencies = {
      tweetsRepo: new DynamoDbTweetsRepo(dynamoDb, stackOutputs.imageInfoTable!),
      imageTweeter,
      imageStorageBucketName: stackOutputs.imageStorageBucket!,
      s3
    };
  });

  const uploadImage = async (objectKey: string, image: Buffer) =>
    await s3.upload(
      {
        Bucket: stackOutputs.imageStorageBucket!,
        Key: objectKey,
        Body: image
      }
    ).promise();

  it("Text and Image from storage is tweeted", async () => {
    const tweetText = uuidv4();
    const tweetImage = fs.readFileSync(testFile);
    const tweetImageKey = uuidv4();

    await uploadImage(tweetImageKey, tweetImage);
    const seedData = await imageInfoRepo.populateDatabaseWithItem(tweetImageKey, tweetText);

    imageTweeter.tweetImage.mockResolvedValue({ id: tweetImageKey });

    const handler: ScheduledHandler = app(testDependencies);
    await handler({} as ScheduledEvent, {} as Context, () => null);

    expect(imageTweeter.tweetImage).toHaveBeenCalledWith(
      seedData?.Content?.M?.Text.S,
      expect.any(String)
    );

    const filePath = imageTweeter.tweetImage.mock.calls[0][1];
    expect(fs.readFileSync(filePath)).toStrictEqual(tweetImage);
  });
});
