import AWS from "aws-sdk";
import axios from "axios";
import { IImageSource } from "messages-lib";
import { IImageDetails } from "messages-lib/lib/messages/imageDetails";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";

jest.setTimeout(20 * 1000);

const assertInputEnvVariablesSet = () => {
  expect(process.env.TF_OUTPUT_aws_region).toBeDefined();
  expect(process.env.TF_OUTPUT_private_url).toBeDefined();
  expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
};

describe("Public Image Details integration test", () => {
  let sns: AWS.SNS;

  beforeAll(() => {
    assertInputEnvVariablesSet();

    AWS.config.update({ region: process.env.TF_OUTPUT_aws_region });
    sns = new AWS.SNS({ apiVersion: "2010-03-31" });
  });

  it("Image details saved and presented by API", async () => {
    const imageId = uuidv4();
    const description = uuidv4();

    const message: IImageDetails = { imageId, description };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: "ImageDetails",
        },
      },
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

  it("Image source saved and presented by API", async () => {
    const imageId = uuidv4();
    const publicUrl = uuidv4();

    const imageSourceMessage: IImageSource = { imageId, publicUrl };

    const params = {
      Message: JSON.stringify(imageSourceMessage),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: "ImageSource",
        },
      },
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
              PublicUrl: {
                S: publicUrl,
              },
            },
          ],
          ScannedCount: 1,
        },
      });
    });
  });

  it("Image details and source saved and presented by API", async () => {
    const imageId = uuidv4();
    const description = uuidv4();
    const publicUrl = uuidv4();

    const imageSourceMessage: IImageSource = { imageId, publicUrl };
    const imageDetailsMessage: IImageDetails = { imageId, description };

    const imageSourceMessageParams = {
      Message: JSON.stringify(imageSourceMessage),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: "ImageSource",
        },
      },
    };
    const imageDetailsMessageParams = {
      Message: JSON.stringify(imageDetailsMessage),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
      MessageAttributes: {
        event: {
          DataType: "String",
          StringValue: "ImageDetails",
        },
      },
    };

    await Promise.all([
      sns.publish(imageSourceMessageParams).promise(),
      sns.publish(imageDetailsMessageParams).promise(),
    ]);

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
              PublicUrl: {
                S: publicUrl,
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
