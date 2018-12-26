import { IBasicImageDetails } from "messages-lib/lib";

import AWS from "aws-sdk";
import axios from "axios";
import { format } from "date-fns";
import waitForExpect from "wait-for-expect";
const uuidv4 = require("uuid/v4");

const defaultTimeout = 5000;
jest.setTimeout(defaultTimeout * 4);

describe("Public Image Details integration test", () => {
  beforeAll(() => {
    expect(process.env.AWS_REGION).toBeDefined();
    expect(process.env.TF_OUTPUT_private_url).toBeDefined();
    expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
  });

  it("Details in event saved to DynamoDB", async () => {
    const imageId = uuidv4();
    const description = uuidv4();

    const message: IBasicImageDetails = { imageId, description };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
    };

    await new AWS.SNS({ apiVersion: "2010-03-31" }).publish(params).promise();

    let result;
    await waitForExpect(async () => {
      result = await axios.get(`${process.env.TF_OUTPUT_private_url}/${imageId}`);

      // Retry until value unique to the test to propagates to the data-store
      expect(result).toMatchObject({
        data: {
          Items: [
            {
              Description: {
                S: description,
              },
            },
          ],
        },
      });
    });

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
