import AWS from "aws-sdk";
import axios from "axios";
import { IBasicImageDetails } from "messages-lib/lib";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";

jest.setTimeout(20 * 1000);

const assertInputEnvVariablesSet = () => {
  expect(process.env.AWS_REGION).toBeDefined();
  expect(process.env.TF_OUTPUT_private_url).toBeDefined();
  expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
};

describe("Public Image Details integration test", () => {
  let sns: AWS.SNS;

  beforeAll(() => {
    assertInputEnvVariablesSet();
    sns = new AWS.SNS({ apiVersion: "2010-03-31" });
  });

  it("Details in event saved to DynamoDB", async () => {
    const imageId = uuidv4();
    const description = uuidv4();

    const message: IBasicImageDetails = { imageId, description };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
    };

    await sns.publish(params).promise();

    let result;
    await waitForExpect(async () => {
      result = await axios.get(`${process.env.TF_OUTPUT_private_url}/${imageId}`);
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
    });
  });
});
