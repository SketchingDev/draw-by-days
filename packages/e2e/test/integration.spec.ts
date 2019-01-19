import AWS from "aws-sdk";
import axios from "axios";
import { IImageDetails } from "messages-lib/lib/messages/imageDetails";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";

const defaultJestTimeout = 5 * 1000;
const imageDetailsAndSourceTimeout = 10 * 1000;
jest.setTimeout(defaultJestTimeout + imageDetailsAndSourceTimeout);

const assertInputEnvVariablesSet = () => {
  expect(process.env.TF_OUTPUT_aws_region).toBeDefined();
  expect(process.env.TF_OUTPUT_bucket_name).toBeDefined();
  expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
  expect(process.env.TF_OUTPUT_private_url).toBeDefined();
};

describe("End to end tests", () => {
  let sns: AWS.SNS;
  let s3: AWS.S3;
  let createdBucketKey: AWS.S3.ManagedUpload.SendData;

  beforeAll(() => {
    assertInputEnvVariablesSet();

    AWS.config.update({ region: process.env.TF_OUTPUT_aws_region });
    sns = new AWS.SNS({ apiVersion: "2010-03-31" });
    s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  });

  afterEach(async () => {
    const deleteObjectParams = {
      Bucket: createdBucketKey.Bucket,
      Key: createdBucketKey.Key,
    };
    await s3.deleteObject(deleteObjectParams).promise();
  });

  it("Image details and source saved and presented by API", async () => {
    const imageId = uuidv4();
    const description = uuidv4();
    const imageDetailsMessage: IImageDetails = { imageId, description };

    const imageDetailsMessageParams = {
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
      Message: JSON.stringify(imageDetailsMessage),
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: "ImageDetails",
        },
      },
    };

    await sns.publish(imageDetailsMessageParams).promise();

    const objectBody = uuidv4();
    const uploadParams = {
      Bucket: process.env.TF_OUTPUT_bucket_name!,
      Key: imageId,
      Body: objectBody,
    };
    createdBucketKey = await s3.upload(uploadParams).promise();

    let publicUrl: string;
    await waitForExpect(async () => {
      const result = await axios.get(`${process.env.TF_OUTPUT_private_url}/${imageId}`);
      expect(result).toMatchObject({
        status: 200,
        data: {
          Count: 1,
          Items: [
            {
              ImageId: {
                S: imageId,
              },
              Description: {
                S: description,
              },
            },
          ],
          ScannedCount: 1,
        },
      });
      expect(result!.data.Items[0]).toHaveProperty("PublicUrl");
      expect(result!.data.Items[0].PublicUrl).toHaveProperty("S");
      expect(result!.data.Items[0].PublicUrl.S).toBeDefined();
      publicUrl = result!.data.Items[0].PublicUrl.S;
    }, imageDetailsAndSourceTimeout);

    const imageContent = await axios.get(publicUrl!);
    expect(imageContent.data).toBe(objectBody);
  });
});
