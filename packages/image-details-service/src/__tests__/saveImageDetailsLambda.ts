import AWS from "aws-sdk";
import { IRecords } from "aws-types-lib";
import { model, ModelConstructor } from "dynamoose";
import lambdaTester from "lambda-tester";
import { IImageDetails } from "messages-lib/lib/messages/imageDetails";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { handler } from "../saveImageDetailsEntry";
import { deps, IDeps } from "../saveImageState";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { configureLocalDynamoDB, listTables, localStackStartupTimeout } from "./utilities/dynamodb";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const defaultJestTimeout = 5 * 1000;
jest.setTimeout(defaultJestTimeout + localStackStartupTimeout);

describe("Saves image details from messaging service", () => {
  const tableName = "Test";
  const imageIdColumnName = "ImageId";
  let ImageRecord: ModelConstructor<IImage, string>;

  beforeAll(async () => {
    configureLocalDynamoDB();
    await waitForExpect(listTables, localStackStartupTimeout);

    ImageRecord = model<IImage, string>(tableName, imageSchema);
    deps.init = (): Promise<IDeps> =>
      Promise.resolve({
        imageRecord: ImageRecord,
      });
  });

  test("Creates new item in DB with image details from event", () => {
    const imageId = uuidv4();
    const description = uuidv4();
    const imageDetails: IImageDetails = {
      imageId,
      description,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageDetails),
          },
        },
      ],
    };

    return lambdaTester(handler)
      .event(snsEvent)
      .expectResult(async () => {
        const record = await ImageRecord.queryOne(imageIdColumnName)
          .eq(imageId)
          .exec();

        expect(record).toMatchObject({
          ImageId: imageId,
          Description: description,
        });
      });
  });

  test("Update item in DB with image details from event", async () => {
    const originalItemId = uuidv4();
    const originalDescription = uuidv4();
    const originalPublicUrl = uuidv4();

    const savedRecord = await new ImageRecord({
      ImageId: originalItemId,
      Description: originalDescription,
      PublicUrl: originalPublicUrl,
    }).save();
    expect(savedRecord).toMatchObject({
      ImageId: originalItemId,
      Description: originalDescription,
      PublicUrl: originalPublicUrl,
    });

    const newDescription = uuidv4();
    const imageDetails: IImageDetails = {
      imageId: originalItemId,
      description: newDescription,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageDetails),
          },
        },
      ],
    };

    return lambdaTester(handler)
      .event(snsEvent)
      .expectResult(async () => {
        const record = await ImageRecord.queryOne(imageIdColumnName)
          .eq(originalItemId)
          .exec();

        expect(record).toMatchObject({
          ImageId: originalItemId,
          Description: newDescription,
          PublicUrl: originalPublicUrl,
        });
      });
  });

  test("Validation fails when SNS event does not match SNS schema", () => {
    const emptyEvent = {};

    return lambdaTester(handler)
      .event(emptyEvent)
      .expectError((item: { message: string }) => {
        expect(item.message).toBe("Event object failed validation");
      });
  });
});
