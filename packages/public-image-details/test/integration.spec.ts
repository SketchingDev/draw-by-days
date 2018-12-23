import { IPublicImageDetails } from "messages-lib/lib";

import AWS from "aws-sdk";
import axios from "axios";
import { format } from "date-fns";
import waitForExpect from "wait-for-expect";

const defaultTimeout = 5000;
jest.setTimeout(defaultTimeout * 4);

describe("Public Image Details integration test", () => {
  beforeAll(() => {
    expect(process.env.AWS_REGION).toBeDefined();
    expect(process.env.TF_OUTPUT_private_url).toBeDefined();
    expect(process.env.TF_OUTPUT_subscribed_topic_arn).toBeDefined();
  });

  let dateIdValue: string;
  let uniqueDescription: string;

  beforeEach(() => {
    dateIdValue = format(Date.now(), "YYYY-MM-DD");
    uniqueDescription = Date.now().toString();
  });

  it("Details in event saved to DynamoDB", async () => {
    const message: IPublicImageDetails = {
      description: uniqueDescription,
      images: [
        {
          publicUrl: "http://example.com/",
          dimensions: {
            width: 1,
            height: 2,
          },
        },
      ],
    };

    const params = {
      Message: JSON.stringify(message),
      TopicArn: process.env.TF_OUTPUT_subscribed_topic_arn,
    };

    await new AWS.SNS({ apiVersion: "2010-03-31" }).publish(params).promise();

    let result;
    await waitForExpect(async () => {
      result = await axios.get(`${process.env.TF_OUTPUT_private_url}/${dateIdValue}`);

      // Retry until value unique to the test to propagates to the data-store
      expect(result).toMatchObject({
        data: {
          Items: [
            {
              Description: {
                S: uniqueDescription,
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
            Images: {
              L: [
                {
                  M: {
                    Dimensions: {
                      M: {
                        Width: {
                          N: "1",
                        },
                        Height: {
                          N: "2",
                        },
                      },
                    },
                    PublicUrl: {
                      S: "http://example.com/",
                    },
                  },
                },
              ],
            },
            DateId: {
              S: dateIdValue,
            },
            Description: {
              S: uniqueDescription,
            },
          },
        ],
        ScannedCount: 1,
      },
    });
  });
});
