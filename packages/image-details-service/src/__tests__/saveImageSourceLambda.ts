import { IRecords } from "aws-types-lib";
import { model, ModelConstructor } from "dynamoose";
import lambdaTester from "lambda-tester";
import { IImageSource } from "messages-lib";
import uuidv4 from "uuid/v4";
import waitForExpect from "wait-for-expect";
import { handler } from "../saveImageSourceEntry";
import { deps, IDeps } from "../saveImageState";
import { IImage } from "../storage/image";
import { imageSchema } from "../storage/imageSchema";
import { configureLocalDynamoDB, listTables, localStackStartupTimeout } from "./utilities/dynamodb";

// tslint:disable-next-line:no-var-requires
require("lambda-tester").noVersionCheck();

const defaultJestTimeout = 5 * 1000;
jest.setTimeout(defaultJestTimeout + localStackStartupTimeout);

describe("Saves image source from messaging service", () => {
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
    const publicUrl = uuidv4();
    const imageSource: IImageSource = {
      imageId,
      publicUrl,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageSource),
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
          PublicUrl: publicUrl,
        });
      });
  });

  test("Update item in DB with image source from event", async () => {
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

    const newPublicUrl = uuidv4();
    const imageSource: IImageSource = {
      imageId: originalItemId,
      publicUrl: newPublicUrl,
    };
    const snsEvent: IRecords = {
      Records: [
        {
          EventSource: "aws:sns",
          Sns: {
            Message: JSON.stringify(imageSource),
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
          Description: originalDescription,
          PublicUrl: newPublicUrl,
        });
      });
  });
});
