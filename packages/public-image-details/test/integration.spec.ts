import { model } from "dynamoose";
import { IPublicImageDetails } from "messages-lib/lib";

import AWS from "aws-sdk";
import { format } from "date-fns";
import waitForExpect from "wait-for-expect";
import { ImageModel, imageSchema } from "../src/image/saveImageDetails";

const defaultTimeout = 5000;
jest.setTimeout(defaultTimeout * 4);

describe("Public Image Details integration test", () => {
  let ImageRecord: any;

  beforeAll(() => {
    expect(process.env.TABLE_NAME).toBeDefined();
    expect(process.env.AWS_REGION).toBeDefined();
    expect(process.env.TOPIC_ARN).toBeDefined();

    ImageRecord = model<ImageModel, { DateId: string }>(process.env.TABLE_NAME!, imageSchema);
  });

  let dateIdValue: string;
  let uniqueDescription: string;

  beforeEach(() => {
    dateIdValue = format(Date.now(), "YYYY-MM-DD");
    uniqueDescription = Date.now().toString();
  });

  afterEach(async () => {
    await ImageRecord.delete({ DateId: dateIdValue });
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
      TopicArn: process.env.TOPIC_ARN,
    };

    await new AWS.SNS({ apiVersion: "2010-03-31" }).publish(params).promise();

    let result;
    await waitForExpect(async () => {
      result = await ImageRecord.queryOne("DateId")
        .eq(dateIdValue)
        .exec();
      expect(result).not.toBeUndefined();
    });

    expect(result).toMatchObject({
      Description: uniqueDescription,
      Images: [
        {
          PublicUrl: "http://example.com/",
          Dimensions: {
            Width: 1,
            Height: 2,
          },
        },
      ],
    });
  });
});
