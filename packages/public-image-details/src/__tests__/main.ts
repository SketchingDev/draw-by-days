import { format } from "date-fns";
import { model } from "dynamoose";
import dynamoose = require("dynamoose");
import lambdaTester from "lambda-tester";
import { IBasicImageDetails } from "messages-lib/lib";
import { ImageModel, imageSchema } from "../image/saveImageDetails";
import { handler } from "../main";
import { IRecords } from "../sns/recordTypes";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const expectMessageProperty = (expectedMessage: string) => {
  return (item: { message: string }) => {
    expect(item.message).toBe(expectedMessage);
  };
};

const configureLocalDynamoDB = () => {
  dynamoose.AWS.config.update({
    accessKeyId: "AKID",
    secretAccessKey: "SECRET",
    region: "us-east-1",
  });

  dynamoose.local("http://127.0.0.1:8000");
};

describe("Handles ImageDetails message over SNS", () => {
  const tableName = "Test";

  beforeAll(() => {
    configureLocalDynamoDB();
    process.env.TABLE_NAME = tableName;
  });

  it("Succeeds with publicUrl of image from event", () => {
    const imageDetails: IBasicImageDetails = {
      description: "Hello World",
      images: [
        {
          dimensions: {
            height: 3,
            width: 4,
          },
          publicUrl: "http://example.com/image.png",
        },
      ],
    };
    const snsEvent: IRecords<string> = {
      Records: [
        {
          Sns: {
            Message: JSON.stringify(imageDetails),
          },
        },
      ],
    };

    const ImageRecord = model<ImageModel, { DateId: string }>(tableName, imageSchema);
    const dateIdValue = format(Date.now(), "YYYY-MM-DD");

    return lambdaTester(handler)
      .event(snsEvent)
      .expectResult(async () => {
        const record = await ImageRecord.queryOne("ImageId")
          .eq(dateIdValue)
          .exec();

        expect(record).toMatchObject({
          Description: "Hello World",
          Images: [
            {
              PublicUrl: "http://example.com/image.png",
              Dimensions: {
                Height: 3,
                Width: 4,
              },
            },
          ],
        });
      });
  });

  it("Fails validation when event does not match SNS schema", () => {
    const emptyEvent = {};

    return lambdaTester(handler)
      .event(emptyEvent)
      .expectError(expectMessageProperty("Event object failed validation"));
  });
});
